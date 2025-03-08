import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute } from "lib/apiUtils";
import { getImage, patchImage } from "./image";
import { LlmTranscription, NoteImage } from "lib/types";

const api = new NextRestApiRoute("/receiveTranscribe");
api.post = async (req, res) => {
    console.log(req.query, req.body);
    const image: NoteImage = await getImage(req.query.id as string);
    if (!image) {
        res.status(404).json({ error: "Image not found" });
        return;
    }

    const transcriptionData: LlmTranscription = req.body;
    image.transcription = transcriptionData;

    const idToken = String(req.query.auth || "");
    console.log("Transcription: ", transcriptionData);
    if (!transcriptionData) {
        res.status(400).json({ error: "No transcription data provided" });
        return;
    }
    if (!transcriptionData.tagline?.trim()?.length) {
        res.status(400).json({ error: "No tagline provided" });
        return;
    }
    const response = await patchImage(image.id, { transcription: transcriptionData }, idToken);
    res.status(200).json(response);
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);
