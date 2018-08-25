
export interface GenericServiceInput {

}

export interface UserServiceInputDataOnly extends GenericServiceInput {
    username: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
}

export interface UserServiceInputNoRelations extends GenericServiceInput {
    username: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    password:string;
}

export interface UserServiceInputFull extends GenericServiceInput {
    username: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    password: string;

    roleId: number;
}

export interface RoleServiceInput extends GenericServiceInput {
    name: string;
    privilegeIds: number[];
}

export interface PrivilegeServiceInput extends GenericServiceInput {
    name: string;
}