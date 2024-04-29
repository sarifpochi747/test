declare interface memberData {
    employeeId: string;
    name: string;
    status: 'Active' | 'Disable';
    gender: 'Man' | 'Woman';
    birthday: string;
    address: string;
    phone: string;
    profileImage?:string;
    uniqueData?:{
            uniqDataId: string,
            uniqColData: string,
            uniqueColumn: {
                uniqColId: string,
                uniqColName: string
            }
        }[];
}