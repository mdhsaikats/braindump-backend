import bcrypt from "bcrypt";

async function passwordHash(password) {
    return await bcrypt.hash(password, 12);
}

async function passwordCompare(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

export { passwordHash, passwordCompare };