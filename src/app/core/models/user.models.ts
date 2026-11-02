/** LocalDate travels as 'yyyy-MM-dd' text, so birthday is a string here. */
export interface UserRegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  stateOfResidence: string;
}

export interface UserProfile {
  username: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  stateOfResidence: string;
}

export interface UserProfileUpdate {
  name: string;
  phone: string;
  birthday: string;
  gender: string;
  stateOfResidence: string;
}