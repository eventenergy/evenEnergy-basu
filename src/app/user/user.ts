export class User{
    constructor(
        public id:number=0,
        public firstName:string='',
        public lastName:string='',
        public status:boolean=true,
        public mobile:any='',
        public email:string='',
        public defaultSnapId:string='',
    ) {}
    
}