import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

const DB_FILE = path.join(process.cwd(), '.students_db.json');

const INITIAL_DEMO_STUDENTS: StudentRecord[] = [];

function readStudents(): StudentRecord[] {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const list = JSON.parse(data);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {}
  
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DEMO_STUDENTS, null, 2));
  } catch (e) {}
  return INITIAL_DEMO_STUDENTS;
}

function writeStudents(students: StudentRecord[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(students, null, 2));
  } catch (e) {}
}

// GET /api/students
export async function GET() {
  const students = readStudents();
  // Filter out any admin accounts
  const filtered = students.filter(s => 
    !s.email?.toLowerCase().includes('admin') && 
    !s.name?.toLowerCase().includes('admin')
  );
  return NextResponse.json({ success: true, data: filtered });
}

// POST /api/students (Add or update student candidate details)
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

    const students = readStudents();

    const existingIdx = students.findIndex(s => 
      (email && s.email && s.email.toLowerCase() === email) ||
      (phone && phone !== 'Not Provided' && s.phone === phone)
    );

    const newRecord: StudentRecord = {
      id: body.id ? `STU-${body.id}` : (existingIdx >= 0 ? students[existingIdx].id : `STU-${Math.floor(1000 + Math.random() * 9000)}`),
      name: name,
      email: email || (existingIdx >= 0 ? students[existingIdx].email : ''),
      phone: phone !== 'Not Provided' ? phone : (existingIdx >= 0 ? students[existingIdx].phone : 'Not Provided'),
      district: body.district || (existingIdx >= 0 ? students[existingIdx].district : 'Thiruvananthapuram'),
      qualification: body.qualification || (existingIdx >= 0 ? students[existingIdx].qualification : 'Graduate'),
      dob: body.dob || (existingIdx >= 0 ? students[existingIdx].dob : ''),
      age: body.age ? `${body.age} Years` : (existingIdx >= 0 ? students[existingIdx].age : ''),
      registeredDate: existingIdx >= 0 ? students[existingIdx].registeredDate : new Date().toISOString().split('T')[0],
      avatar: body.avatar || (existingIdx >= 0 ? students[existingIdx].avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'),
      status: (body.dob && body.qualification) ? 'Completed Onboarding' : (existingIdx >= 0 ? students[existingIdx].status : 'Pending Onboarding')
    };

    if (existingIdx >= 0) {
      students[existingIdx] = { ...students[existingIdx], ...newRecord };
    } else {
      students.unshift(newRecord);
    }

    writeStudents(students);

    return NextResponse.json({ success: true, data: newRecord });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/students (Remove student candidate)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email')?.toLowerCase();

    if (!id && !email) {
      return NextResponse.json({ success: false, message: 'Missing id or email' }, { status: 400 });
    }

    let students = readStudents();
    students = students.filter(s => s.id !== id && (!email || s.email.toLowerCase() !== email));
    writeStudents(students);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
