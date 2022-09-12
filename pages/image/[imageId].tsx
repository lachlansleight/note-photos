import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import Layout from "components/layout/Layout";
import { NoteImage } from "lib/types";
import { getImage } from "pages/api/image";

const ImagePage = ({ image }: { image: NoteImage }): JSX.Element => {
    return (
        <Layout>
            <img src={image.url} className="w-full" />
        </Layout>
    );
};

export async function getServerSideProps(
    ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{ image: NoteImage }>> {
    try {
        const result = await getImage(ctx.query.imageId as string);
        return {
            props: {
                image: result,
            },
        };
    } catch (error: any) {
        return {
            notFound: true,
        };
    }
}

export default ImagePage;
