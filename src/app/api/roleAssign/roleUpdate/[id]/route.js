import { NextResponse } from 'next/server';
import roleService from '@/services/roleService';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const updateData = await request.json();
    const result = await roleService.updateRole(id, updateData);
    
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
