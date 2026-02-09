import { NextResponse } from 'next/server';
import roleService from '@/services/roleService';

export async function GET(request, { params }) {
  try {
    const { id, permission } = params;
    const result = await roleService.hasPermission(id, permission);
    
    if (result.success !== false) {
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
