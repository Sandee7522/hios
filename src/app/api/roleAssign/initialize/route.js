import { NextResponse } from 'next/server';
import roleService from '@/services/roleService';

export async function POST() {
  try {
    const result = await roleService.initializeDefaultRoles();
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    }
    return NextResponse.json(result, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
