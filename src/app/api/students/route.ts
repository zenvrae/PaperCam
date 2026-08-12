import { NextResponse } from 'next/server';
import { ensureStudentsTable, queryWithRetry } from '@/lib/db';
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

// GET /api/students — Fetch all non-admin students from MySQL
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
    console.error('[/api/students GET] Database error:', err.message);
    return NextResponse.json({ success: false, data: [], error: err.message }, { status: 500 });
  }
}

// POST /api/students — Add or update a student candidate in MySQL
export async function POST(req: Request) {
  try {
    await ensureStudentsTable();

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

    const id = body.id ? `STU-${body.id}` : `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const district = body.district || 'Not Provided';
    const qualification = body.qualification || 'Not Provided';
    const dob = body.dob || '';
    const age = body.age ? `${body.age} Years` : '';
    const registeredDate = new Date().toISOString().split('T')[0];
    const avatar = body.avatar || '';
    const status = (body.dob && body.qualification && body.district && body.district !== 'Not Provided') ? 'Completed Onboarding' : 'Pending Onboarding';

    if (email) {
      // Upsert by email: update if exists, insert if new
      const existing = await queryWithRetry<RowDataPacket[]>(
        'SELECT id, registered_date FROM students WHERE email = ?',
        [email]
      );

      if (existing.length > 0) {
        // Update existing record
        await queryWithRetry(
          `UPDATE students SET name = ?, phone = CASE WHEN ? != 'Not Provided' THEN ? ELSE phone END,
           district = CASE WHEN ? != 'Thiruvananthapuram' THEN ? ELSE district END,
           qualification = CASE WHEN ? != 'Graduate' THEN ? ELSE qualification END,
           dob = CASE WHEN ? != '' THEN ? ELSE dob END,
           age = CASE WHEN ? != '' THEN ? ELSE age END,
           avatar = CASE WHEN ? != '' THEN ? ELSE avatar END,
           status = ? WHERE email = ?`,
          [name, phone, phone, district, district, qualification, qualification,
           dob, dob, age, age, avatar, avatar, status, email]
        );
      } else {
        // Insert new record
        await queryWithRetry(
          `INSERT INTO students (id, name, email, phone, district, qualification, dob, age, registered_date, avatar, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, name, email, phone, district, qualification, dob, age, registeredDate, avatar, status]
        );
      }
    } else {
      // Insert by phone only (no email)
      await queryWithRetry(
        `INSERT INTO students (id, name, email, phone, district, qualification, dob, age, registered_date, avatar, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone)`,
        [id, name, '', phone, district, qualification, dob, age, registeredDate, avatar, status]
      );
    }

    return NextResponse.json({ success: true, message: 'Student record saved to database' });
  } catch (err: any) {
    console.error('[/api/students POST] Database error:', err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE /api/students — Remove a student from MySQL
export async function DELETE(req: Request) {
  try {
    await ensureStudentsTable();

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!studentId && !email) {
      return NextResponse.json({ success: false, message: 'Missing student id or email' }, { status: 400 });
    }

    if (email) {
      await queryWithRetry('DELETE FROM students WHERE email = ?', [email.toLowerCase()]);
    } else {
      await queryWithRetry('DELETE FROM students WHERE id = ?', [studentId]);
    }

    return NextResponse.json({ success: true, message: 'Student removed from database' });
  } catch (err: any) {
    console.error('[/api/students DELETE] Database error:', err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

