import { NextRequest, NextResponse } from 'next/server';

import { updateProfileDetails, userInfo } from '../../../lib/user';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uuid = searchParams.get('uuid');
    console.log(uuid);
    const userData = await userInfo(uuid);
    return NextResponse.json({ userData }, { status: 200 });
  } catch (error) {
    console.log(error);
    throw NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, uuid, language } = body;
    const userData = await updateProfileDetails(firstName, lastName, uuid, language);
    return NextResponse.json({ userData }, { status: 200 });
  } catch (error) {
    console.log(error);
    throw NextResponse.json({ error }, { status: 500 });
  }
}
