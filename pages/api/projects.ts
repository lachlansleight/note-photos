import { NextApiRequest, NextApiResponse } from "next";
import { NextRestApiRoute } from "lib/apiUtils";
import Database from "lib/Database";

export const getProjectList = async () => {
    const projects = await Database.Instance().project.findMany({
        select: {
            id: true,
            slug: true,
            name: true,
        },
    });
    await Database.disconnect();
    return projects;
};

const api = new NextRestApiRoute("/projects");
api.get = async (req, res) => {
    const projects = await getProjectList();
    res.json(projects);
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);
