export class UserBankAccount{
    constructor(
        public id:number=0,
        public accountNumber:string='',
        public accountHolderName:string='',
        public branchName:any='',
        public bankName:string='',
        public ifscCode:string='',
        public gstNumber:string='',
        public panNumber:string='',
        public userId:number=0,
        public schoolId:number=0,
        public accountType:number=0
    ) {}
    
}