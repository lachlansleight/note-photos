import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute } from "lib/apiUtils";
import { getImage } from "./image";
import { NoteImage } from "lib/types";
import axios from "axios";

export const getParabrainTranscription = async (image: NoteImage, idToken: string) => {
    //todo - parabrain needs a receive post request first, otherwise I can't send the whole noteImage
    //OR DOES IT >:D

    //...yes it does. I'm back now I made it work

    console.log("POSTing parabrain...");
    const response = (await axios.post("http://localhost:4937/message?id=transcribeImage", {image, idToken}));
    return response.data;
}

const api = new NextRestApiRoute("/transcribe");
api.get = async (req, res) => {
    const image: NoteImage = await getImage(req.query.id as string);
    const idToken = req.query.auth as string;
    if (!image) {
        console.error("Image not found for ID " + req.query.id);
        res.status(404).json({ error: "Image not found" });
        return;
    }

    const forceEvenIfTranscribed = req.query.force === "true";
    const imageHasTranscription = image.transcription && image.transcription.tagline?.trim()?.length;
    if (imageHasTranscription && !forceEvenIfTranscribed) {
        console.log("Image is already transcribed and force mode is off");
        res.json(image.transcription);
        return;
    }

    const transcriptionData = await getParabrainTranscription(image, idToken);
    res.status(200).json(transcriptionData);
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);
