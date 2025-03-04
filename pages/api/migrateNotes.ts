import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { NextRestApiRoute } from "lib/apiUtils";
import Database from "lib/Database";

const api = new NextRestApiRoute("/migrateNotes");
api.get = async (req, res) => {
    const existingNotes = (
        await axios(`${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/images.json`)
    ).data;
    const projectNames: string[] = [];
    Object.keys(existingNotes).forEach((key: any) => {
        const note = existingNotes[key];
        note.projects.forEach((project: any) => {
            if (!projectNames.includes(project.name)) projectNames.push(project.name);
        });
    });

    const actualProjects = await Database.Instance().project.findMany({
        select: {
            name: true,
            id: true,
        },
    });

    const missingNames = projectNames.filter(
        n => actualProjects.findIndex(p => p.name === n) === -1
    );

    // const renames = {
    //     "Weeklog": "WeekLog",
    //     "Lineagyra": "Linea Gyra",
    //     "Wotlk Items": "WotLK Items",
    //     "Lab Directory": "LabDirectory",
    //     "LED Matrix": "RGB Matrix",
    //     "ProcMu": "Procmu",
    //     "Espresso Machine Mods": "Espresso Machine Mod",
    //     "Optical Flow": "OpticalFlow",
    // };
    //Object.keys(existingNotes).forEach((key: string) => {
    //    const note = existingNotes[key];
    //    note.projects.forEach((project: any) => {
    //        if((renames as any)[project.name]) project.name = (renames as any)[project.name];
    //    });
    //});
    //await axios.put(`${process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL}/images.json`, existingNotes);
    //res.json({result: "rewrote everything eep"})

    const databaseNotes = await Database.Instance().notePage.findMany();
    const missingNotes = Object.keys(existingNotes).filter(key => {
        return databaseNotes.findIndex(dbn => dbn.url === existingNotes[key].url) === -1;
    });

    for (let i = 0; i < missingNotes.length; i++) {
        const note = existingNotes[missingNotes[i]];
        const createData = await Database.Instance().notePage.create({
            data: {
                filename: note.id + ".jpg",
                width: note.width,
                height: note.height,
                size: note.size,
                fileType: "image/jpeg",
                s3Key: "",
                thumbnailS3Key: "",
                url: note.url,
                thumbnailUrl: note.thumbnailUrl,
                notes: {
                    create: note.projects.map((project: any) => {
                        const realProject = actualProjects.find(p => p.name === project.name);
                        if (realProject) {
                            return {
                                createdAt: project.date,
                                category: "project",
                                project: {
                                    connect: {
                                        id: realProject.id,
                                    },
                                },
                            };
                        } else {
                            return {
                                createdAt: project.date,
                                category: project.name,
                            };
                        }
                    }),
                },
            },
            select: {
                id: true,
            },
        });
        console.log("Created note page", createData.id);
    }

    res.json({ projectNames, existingNotes, missingNotes });
};

export default (req: NextApiRequest, res: NextApiResponse) => api.handle(req, res);
