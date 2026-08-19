import { NextResponse } from 'next/server';
import { ensureStudentsTable, queryWithRetry, getLocalStudents, saveLocalStudents } from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

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

// GET /api/students — Fetch all non-admin students from MySQL or JSON fallback
export async function GET() {
  try {
    await ensureStudentsTable();

    const rows = await queryWithRetry<RowDataPacket[]>(
      `SELECT id, name, email, phone, district, qualification, dob, age,
              registered_date AS registeredDate, avatar, status
       FROM students
       WHERE email NOT LIKE '%admin%' AND name NOT LIKE '%admin%'
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (err: any) {
    // If MySQL connection fails (ECONNREFUSED or missing DB), return local JSON database
    const local = getLocalStudents();
    const filtered = local.filter((u: any) => {
      const email = (u.email || '').toLowerCase();
      const name = (u.name || '').toLowerCase();
      return !email.includes('admin') && !name.includes('admin');
    });
    return NextResponse.json({ success: true, data: filtered, fallback: true });
  }
}

// POST /api/students — Add or update a student candidate in MySQL or JSON fallback
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const name = body.name || (email ? email.split('@')[0] : 'PSC Candidate');
    const phone = body.phone || 'Not Provided';

    if (!email && !phone && !name) {
      return NextResponse.json({ success: false, message: 'Invalid student data' }, { status: 400 });
    }

    // Ignore admin registrations in student directory
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

    const newRecord = { id, name, email, phone, district, qualification, dob, age, registeredDate, avatar, status };

    // Always update local JSON storage
    const local = getLocalStudents();
    const existingIdx = local.findIndex((s: any) => (email && s.email && s.email.toLowerCase() === email) || s.id === id);
    if (existingIdx >= 0) {
      local[existingIdx] = { ...local[existingIdx], ...newRecord };
    } else {
      local.unshift(newRecord);
    }
    saveLocalStudents(local);

    // Attempt MySQL sync
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
             status = ? WHERE email = ?`,
            [name, phone, phone, district, qualification, dob, dob, age, age, avatar, avatar, status, email]
          );
        } else {
          await queryWithRetry(
            `INSERT INTO students (id, name, email, phone, district, qualification, dob, age, registered_date, avatar, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), phone = VALUES(phone), status = VALUES(status)`,
            [id, name, email, phone, district, qualification, dob, age, registeredDate, avatar, status]
          );
        }
      }
    } catch (mysqlErr: any) {
      // MySQL write failed (ECONNREFUSED) - safely saved in local JSON fallback
    }

    return NextResponse.json({ success: true, message: 'Student record saved successfully' });
  } catch (err: any) {
    console.error('[/api/students POST] Error:', err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE /api/students — Soft delete a student (changes status to removed)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!studentId && !email) {
      return NextResponse.json({ success: false, message: 'Missing student id or email' }, { status: 400 });
    }

    // Update local JSON database
    const local = getLocalStudents();
    const targetIdx = local.findIndex((s: any) => (email && s.email && s.email.toLowerCase() === email.toLowerCase()) || s.id === studentId);
    if (targetIdx >= 0) {
      local[targetIdx].status = 'removed';
      saveLocalStudents(local);
    }

    try {
      await ensureStudentsTable();
      if (email) {
        await queryWithRetry("UPDATE students SET status = 'removed' WHERE email = ?", [email.toLowerCase()]);
      } else {
        await queryWithRetry("UPDATE students SET status = 'removed' WHERE id = ?", [studentId]);
      }
    } catch (dbErr: any) {}

    return NextResponse.json({ success: true, message: 'Student status set to removed' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PATCH /api/students — Restore a removed student
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!studentId && !email) {
      return NextResponse.json({ success: false, message: 'Missing student id or email' }, { status: 400 });
    }

    // Update local JSON database
    const local = getLocalStudents();
    const targetIdx = local.findIndex((s: any) => (email && s.email && s.email.toLowerCase() === email.toLowerCase()) || s.id === studentId);
    if (targetIdx >= 0) {
      local[targetIdx].status = 'Completed Onboarding';
      saveLocalStudents(local);
    }

    try {
      await ensureStudentsTable();
      if (email) {
        await queryWithRetry("UPDATE students SET status = 'Completed Onboarding' WHERE email = ?", [email.toLowerCase()]);
      } else {
        await queryWithRetry("UPDATE students SET status = 'Completed Onboarding' WHERE id = ?", [studentId]);
      }
    } catch (dbErr: any) {}

    return NextResponse.json({ success: true, message: 'Student restored successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

