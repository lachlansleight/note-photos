import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute } from "lib/apiUtils";
import Database from "lib/Database";
import axios from "axios";

export const getProjectList = async () => {
    const projects = (await axios(`${process.env.WEEKLOG_URL}/api/projects?email=${process.env.WEEKLOG_EMAIL}&password=${process.env.WEEKLOG_PASSWORD}`)).data;
    return projects.map((p: any) => {
        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
        }
    });
};

const api = new NextRestApiRoute("/projects");
api.get = async (req, res) => {
    const projects = await getProjectList();
    res.json(projects);
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);
