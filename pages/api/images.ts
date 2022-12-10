import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { NoteImage } from "lib/types";

export const getImages = async (): Promise<NoteImage> => {
    try {
        const image: any = await axios(
            `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/images.json`
        );
        return image.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    //const idToken = String(req.query.auth || "");
    let statusCode = 200;
    try {
        let response: any = null;
        if (req.method === "GET") {
            response = await getImages();

            res.status(200).json({ images: response });
        } else {
            statusCode = 405;
            throw new Error(`${req.method} not supported for /images`);
        }
    } catch (error: any) {
        const parsedError = error.message;
        if (req.method) console.error(`Failed to ${req.method} images`, parsedError);
        else console.error("Failed on image request", parsedError);
        if (!parsedError) console.error(error);
        if (statusCode === 200) statusCode = 500;
        res.status(statusCode).json({
            success: false,
            error: parsedError.message,
        });
    }
};
