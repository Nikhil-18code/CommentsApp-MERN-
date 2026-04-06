const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const SECRET = "mysecretkey";

const generateUserId = () => {
    return "USR-" + Date.now();
}
exports.register = async (req, res) => {
     try {
            const {username, email, password, role} = req.body;
            if(!email || !password){
                return res.status(400).json({error: "Email and password are required" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User (
                {
                    userId: generateUserId(),
                    username,
                    email,
                    password: hashedPassword,
                    role: role || 'user'
                }
            )
            await user.save();
            res.json({message: "Registered successfully"});
        } catch(err){  
            res.status(500).json({error: err.message});
        }
}

exports.login = async (req, res) => {
     try {
            const {email, password} = req.body;
            const user = await User.findOne({email});
            if(!user){
                return res.status(400).json({error: "User not  found" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(400).json({error: "Invalid email or password" });
            }
            const token = jwt.sign(
                { id: user._id, role: user.role },
                SECRET,
                { expiresIn: '1h' }
            );
    
            res.json({
                token,
                user : {
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                }
            })
        } catch(err){
            res.status(500).json({error: err.message});
        }
}

exports.getProfile = async (req, res) => {
     try {
       const user = await User.findById(req.user.id);
       res.json(user);
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
}