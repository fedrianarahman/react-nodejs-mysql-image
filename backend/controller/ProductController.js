import Product from "../models/ProductModels.js"
import path from "path";
import fs from "fs";

export const getProducts = async (req,res) =>{
    try {
        const response = await Product.findAll();
        res.json(response);
    } catch (error) {
        console.log(error.message);
    }
}

export const getProductsById = async (req,res) =>{
    try {
        const response = await Product.findOne({
            where :{
                // id berdasarkan field id pada database
                id : req.params.productsId
            }
        });
        res.json(response);
    } catch (error) {
        console.log(error.message);
    }
}

export const insertProducts = (req,res) =>{
    if(req.files === null) res.status(400).json({
        message : "No file Uploaded"
    })

    const name = req.body.title;
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = ['.png','.jpg','.jpeg'];

    if (!allowedType.includes(ext.toLocaleLowerCase())) {
        return res.status(422).json({
            message : "Invalid image"
        });
    }

    if (fileSize > 5000000) {
        return res.status(422).json({
            message : "Image terlalu besar"
        });
    }

    file.mv(`./public/images/${fileName}`, async (error)=>{
        if(error) return res.status(500).json({
            message : error.message
        });

        try {
            await Product.create({name : name, image : fileName, url : url});
            res.status(201).json({
                message : "create data successfully"
            });
        } catch (error) {
            console.log(error.message);
        }
    })
}

export const updateProducts = async (req,res) =>{
    const product = await Product.findOne({
        where:{
            id : req.params.productsId
        }
    });
    if(!product) return res.status(404).json({msg: "No Data Found"});
    
    let fileName = "";
    if(req.files === null){
        fileName = product.image;
    }else{
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        fileName = file.md5 + ext;
        const allowedType = ['.png','.jpg','.jpeg'];

        if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
        if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});

        const filepath = `./public/images/${product.image}`;
        fs.unlinkSync(filepath);

        file.mv(`./public/images/${fileName}`, (err)=>{
            if(err) return res.status(500).json({msg: err.message});
        });
    }
    const name = req.body.title;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    
    try {
        await Product.update({name: name, image: fileName, url: url},{
            where:{
                id: req.params.productsId
            }
        });
        res.status(200).json({msg: "Product Updated Successfuly"});
    } catch (error) {
        console.log(error.message);
    }
}

export const deleteProducts = async (req,res) =>{
    const product = await Product.findOne({
        where :{
            // id berdasarkan field id pada database
            id : req.params.productsId
        }
    });

    if(!product) return res.status(404).json({
        message : "No Data Found"
    });

    try {
        const filePath = `./public/images/${product.image}`;
        fs.unlinkSync(filePath);
        await Product.destroy({
            where :{
                // id berdasarkan field id pada database
                  id : req.params.productsId 
            }
        });
        res.status(200).json({
            message : "Product deleted successfully"
        })
    } catch (error) {
        console.log(error.message);
    }
}