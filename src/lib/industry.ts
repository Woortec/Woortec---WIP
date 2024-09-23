import { createClient } from '../../utils/supabase/server';

export async function addIndustry(industryName: string, dateOfBirth: string, uuid: string) {
  const supabase = createClient();

  try {
    await supabase.from('user').update({ isIndustry: true }).eq('uuid', uuid);

    const { data, error: insertError } = await supabase.from('Industry').insert({
      name: industryName,
      user_id: uuid,
      date_of_birth: dateOfBirth,
    });

    if (insertError) {
      console.error('Error inserting industry:', insertError);
      return;
    }

    console.log('Inserted industry data:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}
