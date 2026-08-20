import { NextResponse } from 'next/server';
import { ensureStudentsTable, queryWithRetry } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

const WP_STUDENTS_ENDPOINT = 'https://papercam.wasmer.app/wp-json/psc/v1/students';
const WP_PROFILE_ENDPOINT = 'https://papercam.wasmer.app/wp-json/psc/v1/me/profile';

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  qualification: string;
  dob: string;
  age: string;
  registeredDate: string;
  avatar: string;
  status: string;
}

// GET /api/students — Fetch all candidates from MySQL database and sync with WordPress REST API
export async function GET(req: Request) {
  let dbCandidates: any[] = [];

  // 1. Fetch from MySQL database
  try {
    await ensureStudentsTable();
    const rows = await queryWithRetry<RowDataPacket[]>(
      `SELECT id, name, email, phone, district, qualification, dob, age,
              registered_date AS registeredDate, avatar, status
       FROM students
       WHERE email NOT LIKE '%admin%' AND name NOT LIKE '%admin%'
       ORDER BY created_at DESC`
    );
    dbCandidates = rows;
  } catch (err: any) {}

  // 2. Fetch from WordPress REST API if auth header is available
  let wpCandidates: any[] = [];
  try {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader) {
      const res = await fetch(WP_STUDENTS_ENDPOINT, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || data.students || []);
        wpCandidates = list.filter((u: any) => {
          const email = (u.email || u.user_email || '').toLowerCase();
          const name = (u.name || u.display_name || '').toLowerCase();
          return !email.includes('admin') && !name.includes('admin');
        });
      }
    }
  } catch (e) {}

  // Merge Database + WordPress REST API candidates
  const map = new Map<string, any>();
  [...dbCandidates, ...wpCandidates].forEach(st => {
    const key = (st.email || st.id || '').toLowerCase();
    if (key && !key.includes('admin')) {
      map.set(key, st);
    }
  });

  return NextResponse.json({ success: true, data: Array.from(map.values()) });
}

// POST /api/students — Add candidate to MySQL database and proxy to WordPress REST API
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const name = (body.name || '').trim() || (email ? email.split('@')[0] : '');
    const phone = (body.phone || '').trim();

    // Strict Validation: Require valid email and candidate name
    if (!email || !name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Invalid candidate profile: Full Name and valid Email are required' }, 
        { status: 400 }
      );
    }

    if (email.includes('admin') || body.role === 'admin' || body.role === 'super_admin') {
      return NextResponse.json({ success: true, message: 'Admin account ignored for student directory' });
    }

    const rawId = String(body.id || '');
    const id = rawId ? (rawId.startsWith('STU-') ? rawId : `STU-${rawId}`) : `STU-${Date.now()}`;
    const district = (body.district && body.district !== 'Not Provided') ? body.district : 'Thiruvananthapuram';
    const qualification = (body.qualification && body.qualification !== 'Not Provided') ? body.qualification : 'Graduate (B.A / B.Sc / B.Com / B.Tech)';
    const dob = body.dob || '';
    const age = body.age ? `${body.age} Years` : (body.dob ? `${new Date().getFullYear() - new Date(body.dob).getFullYear()} Years` : '');
    const registeredDate = new Date().toISOString().split('T')[0];
    const avatar = body.avatar || '';
    const status = 'Completed Onboarding';

    const newRecord = { id, name, email, phone: phone || 'Not Provided', district, qualification, dob, age, registeredDate, avatar, status };

    let dbSuccess = false;

    // 1. Save candidate to Wasmer MySQL database table
    try {
      await ensureStudentsTable();
      if (email) {
        const existing = await queryWithRetry<RowDataPacket[]>(
          'SELECT id, registered_date FROM students WHERE email = ?',
          [email]
        );
        if (existing.length > 0) {
          await queryWithRetry(
            `UPDATE students SET name = ?, phone = CASE WHEN ? != 'Not Provided' THEN ? ELSE phone END,
             district = ?, qualification = ?,
             dob = CASE WHEN ? != '' THEN ? ELSE dob END,
             age = CASE WHEN ? != '' THEN ? ELSE age END,
             avatar = CASE WHEN ? != '' THEN ? ELSE avatar END,
             status = ?, onboarding_completed = 1 WHERE email = ?`,
            [name, phone, phone, district, qualification, dob, dob, age, age, avatar, avatar, status, email]
          );
        } else {
          await queryWithRetry(
            `INSERT INTO students (id, name, email, phone, district, qualification, dob, age, registered_date, avatar, status, onboarding_completed)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
             ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), phone = VALUES(phone), status = VALUES(status), onboarding_completed = 1`,
            [id, name, email, phone, district, qualification, dob, age, registeredDate, avatar, status]
          );
        }
        dbSuccess = true;
      }
    } catch (mysqlErr: any) {
      console.error('[/api/students POST] Wasmer MySQL insert error:', mysqlErr.message);
    }

    // 2. Proxy POST to WordPress REST API
    let wpSuccess = false;
    try {
      const authHeader = req.headers.get('authorization') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authHeader) headers['Authorization'] = authHeader;
      const res = await fetch(WP_PROFILE_ENDPOINT, { method: 'POST', headers, body: JSON.stringify(body) });
      if (res.ok) {
        wpSuccess = true;
      }
    } catch (wpErr: any) {}

    if (dbSuccess || wpSuccess) {
      return NextResponse.json({ success: true, message: 'Student record added to database successfully', data: newRecord });
    }

    return NextResponse.json({ success: false, message: 'Failed to save student record to database.' }, { status: 500 });
  } catch (err: any) {
    console.error('[/api/students POST] Error:', err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE /api/students — Delete / remove student status in database & WordPress REST API
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!studentId && !email) {
      return NextResponse.json({ success: false, message: 'Missing student id or email' }, { status: 400 });
    }

    try {
      await ensureStudentsTable();
      if (email) {
        await queryWithRetry("UPDATE students SET status = 'removed' WHERE email = ?", [email.toLowerCase()]);
      } else {
        await queryWithRetry("UPDATE students SET status = 'removed' WHERE id = ?", [studentId]);
      }
    } catch (dbErr: any) {}

    try {
      const authHeader = req.headers.get('authorization') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authHeader) headers['Authorization'] = authHeader;
      if (studentId) {
        await fetch(`${WP_STUDENTS_ENDPOINT}/${encodeURIComponent(studentId)}`, { method: 'DELETE', headers });
      }
    } catch (wpErr: any) {}

    return NextResponse.json({ success: true, message: 'Student status set to removed' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PATCH /api/students — Restore student status in database & WordPress REST API
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!studentId && !email) {
      return NextResponse.json({ success: false, message: 'Missing student id or email' }, { status: 400 });
    }

    try {
      await ensureStudentsTable();
      if (email) {
        await queryWithRetry("UPDATE students SET status = 'Completed Onboarding' WHERE email = ?", [email.toLowerCase()]);
      } else {
        await queryWithRetry("UPDATE students SET status = 'Completed Onboarding' WHERE id = ?", [studentId]);
      }
    } catch (dbErr: any) {}

    try {
      const authHeader = req.headers.get('authorization') || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authHeader) headers['Authorization'] = authHeader;
      if (studentId) {
        await fetch(`${WP_STUDENTS_ENDPOINT}/${encodeURIComponent(studentId)}/restore`, { method: 'POST', headers });
      }
    } catch (wpErr: any) {}

    return NextResponse.json({ success: true, message: 'Student restored successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}


