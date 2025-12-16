export default interface User {
    id: number;
    username : string;
    email : string;
    plan : string;
    urlProfilePhoto : string;
    language : string;
    theme : string;
    explicitContent : boolean;
    token : string;
}