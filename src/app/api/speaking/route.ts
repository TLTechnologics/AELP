import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const token = req.headers.get('authorization');
    
    // Forward the exact same FormData to Render
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aelp.onrender.com/api';
    
    const res = await fetch(`${API_BASE_URL}/speaking/evaluate`, {
      method: 'POST',
      headers: token ? { 'Authorization': token } : {},
      body: formData,
    });
    
    const data = await res.json().catch(() => ({}));
    
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Proxy Error:', error);
    return NextResponse.json(
      { detail: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
