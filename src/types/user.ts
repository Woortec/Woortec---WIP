export interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
  [key: string]: unknown; // Allow for additional metadata fields
}

export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  user_metadata?: UserMetadata; // Include user_metadata in the User interface

  [key: string]: unknown; // Allow for additional user properties
}
