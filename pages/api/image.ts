import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { NoteImage } from "lib/types";

export const getImage = async (id: string): Promise<NoteImage> => {
    try {
        const image: any = await axios(
            `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/images/${id}.json`
        );
        return image.data;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getNewImageId = async (idToken: string): Promise<string> => {
    try {
        const result = await axios.post(
            `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/images.json?auth=${idToken}`,
            {}
        );
        return result.data.name;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const putImage = async (image: NoteImage, idToken: string): Promise<void> => {
    try {
        await axios.put(
            `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/images/${image.id}.json?auth=${idToken}`,
            image
        );
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const patchImage = async (
    id: string,
    image: Partial<NoteImage>,
    idToken: string
): Promise<void> => {
    try {
        await axios.patch(
            `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/images/${image.id}.json?auth=${idToken}`,
            image
        );
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deleteImage = async (id: string, idToken: string): Promise<void> => {
    try {
        await axios.delete(
            `${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/images/${id}.json?auth=${idToken}`
        );
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const idToken = String(req.query.auth || "");
    let statusCode = 200;
    try {
        let response: any = null;
        if (req.method === "GET") {
            const id = String(req.query.id);

            response = await getImage(id);

            res.status(200).json(response);
        } else if (req.method === "POST") {
            if (!idToken) {
                statusCode = 401;
                throw new Error("User must be authenticated to POST images");
            }
            try {
                response = await getNewImageId(idToken);
                res.status(200).json({ id: response });
            } catch (error: any) {
                statusCode = 500;
                throw new Error(error);
            }
        } else if (req.method === "PUT") {
            if (!idToken) {
                statusCode = 401;
                throw new Error("User must be authenticated to PUT images");
            }
            try {
                response = await putImage(req.body, idToken);
                res.status(200).json({ id: response });
            } catch (error: any) {
                statusCode = 500;
                throw new Error(error);
            }
        } else if (req.method === "PATCH") {
            if (!idToken) {
                statusCode = 401;
                throw new Error("User must be authenticated to PATCH images");
            }
            try {
                const id = String(req.query.id);
                response = await patchImage(id, req.body, idToken);
                res.status(200).json(response);
            } catch (error: any) {
                statusCode = 500;
                throw new Error(error);
            }
        } else if (req.method === "DELETE") {
            if (!idToken) {
                statusCode = 401;
                throw new Error("User must be authenticated to DELETE images");
            }
            try {
                const id = String(req.query.id);
                response = await deleteImage(id, idToken);
                res.status(200).json(response);
            } catch (error: any) {
                statusCode = 500;
                throw new Error(error);
            }
        } else {
            statusCode = 405;
            throw new Error(`${req.method} not supported for /image`);
        }
    } catch (error: any) {
        const parsedError = error.message || error;
        if (req.method) console.error(`Failed to ${req.method} image`, parsedError.message);
        else console.error("Failed on image request", parsedError.message);
        if (statusCode === 200) statusCode = 500;
        res.status(statusCode).json({
            success: false,
            error: parsedError.message,
        });
    }
};
