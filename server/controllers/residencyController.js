import asyncHandler from "express-async-handler";

import { prisma } from '../config/prismaConfig.js'

// function to create a new residency
// export const createResidency = asyncHandler(async(req, res) => {
//     const {title, description, price, address, country, city, facilities, image, 
//           userEmail} = req.body.data;

//         console.log(req.body.data);

//         try {
//             const residency = await prisma.residency.
//             create({
//                 data: {
//                 title, 
//                 description, 
//                 price, 
//                 address, 
//                 country, city, 
//                 facilities,
//                 image,
//                 owner : {connect :{email: userEmail}},
//                   },  
//                 });
                
//                 res.send({ message: "Residency created successfully", residency})
//         } catch (error) {
//             if(error.code === "P2002")
//             {
//                 throw new Error("A residency with the Address exists")
//             }
//             throw new Error(error.message)
//         }
// })

export const createResidency = asyncHandler(async(req, res) => {
    function removeUndefined(obj) {
        return JSON.parse(JSON.stringify(obj));
      }
      
    
    // const  cleanedProperty_data  =removeUndefined(req.body);
    let  cleanedProperty_data  =req.body;
    const normalizeArray = (value) => {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
      };

      cleanedProperty_data = {
        ...req.body,
        schools: normalizeArray(req.body.schools)
      }

        console.log(cleanedProperty_data);

        try {
            const residency = await prisma.property.
            create({ data: cleanedProperty_data,  
                });
                
                res.send({ message: "Residency created successfully", residency})
        } catch (error) {
            if(error.code === "P2002")
            {
                throw new Error("A residency with the Address exists")
            }
            throw new Error(error.message)
        }
})

 // function to get all residencies
   export  const getAllResidencies = asyncHandler(async(req, res) =>{
    try {
        const residencies = await prisma.property.findMany({
            // orderBy: {
            //     createdAt : "desc"
            // }
        })    
        res.send(residencies)
        // console.log(residencies)

    } catch (error) {
        throw new Error(error.message)
        
    }  

})

// function to get one residency by id
    export const getResidency = asyncHandler(async(req, res) => {
        const {id} = req.params;
        console.log("Received ID from frontend:", id);
        try {
                const residency = await prisma.property.findUnique({
                    where: {id: id},
                })
                // console.log(residency)


                res.send(residency)
                
               } catch (error) {
                throw new Error(error.message);
            }
   
    })

