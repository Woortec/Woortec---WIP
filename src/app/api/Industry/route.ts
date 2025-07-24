import { NextRequest, NextResponse } from 'next/server';

import { addIndustry } from '../../../lib/industry';

export async function POST(req: NextRequest) {
  try {
    
    const body = await req.json();
    const { industryName, dateOfBirth, uuid } = body;
    const industry = await addIndustry(industryName, dateOfBirth, uuid);
    console.log(industryName, dateOfBirth, uuid);
    return NextResponse.json({ industry }, { status: 200 });
  } catch (error) {
    console.log(error);
    throw NextResponse.json({ error }, { status: 500 });
  }
}
