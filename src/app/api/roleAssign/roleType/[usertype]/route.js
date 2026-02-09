import { NextResponse } from 'next/server';
import roleService from '@/services/roleService';

export async function GET(request, { params }) {
  try {
    const { userType } = params;
    const result = await roleService.getRoleByType(userType);
    
    if (result.success) {
      return NextResponse.json(result);
    }
    return NextResponse.json(result, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
