
export interface GenericServiceOutput {
  id: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface UserServiceOutput extends GenericServiceOutput {
  username: string;
  firstName: string;
  lastName: string;
  emailAddress: string;

  role: RoleServiceOutput;
  roleId:number;
}

export interface RoleServiceOutput extends GenericServiceOutput {
  name: string;
  privileges: PrivilegeServiceOutput[];
}

export interface PrivilegeServiceOutput extends GenericServiceOutput {
  name: string;
}