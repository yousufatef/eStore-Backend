import bcrypt from "bcrypt";

const users = [
  {
    name: "Admin",
    email: "admin@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: true,
  },
  {
    name: "Joe Atef",
    email: "joe@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: false,
  },
  {
    name: "Magda Ahmed",
    email: "magda@gmail.com",
    password: bcrypt.hashSync("123456", 10),
    isAdmin: false,
  },
];


export default users;