import { createClient } from '../../utils/supabase/server';

export async function userInfo(uuid: any) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.from('user').select('*').eq('uuid', uuid).single();
    console.log(data);
    return data;
  } catch (error) {
    console.log('error', error);
  }
}

export async function updateProfileDetails(firstName: string, lastName: string, uuid: any) {
  const supabase = createClient();
  try {
    const user = await supabase.from('user').update({ isIndustry: true, firstName, lastName }).eq('uuid', uuid);
    return true;
  } catch (error) {
    console.log('error', error);
  }
}
