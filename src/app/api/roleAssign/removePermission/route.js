import { NextResponse } from 'next/server';
import roleService from '@/services/roleService';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const { permission } = await request.json();
    
    if (!permission) {
      return NextResponse.json(
        { success: false, message: 'Permission is required' },
        { status: 400 }
      );
    }
    
    const result = await roleService.removePermission(id, permission);
    
    if (result.success) {
      return NextResponse.json(result);
    }
    return NextResponse.json(result, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
