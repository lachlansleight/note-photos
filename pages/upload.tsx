import { useState } from "react";
import Layout from "components/layout/Layout";
import PhotoForm from "components/PhotoForm";
import TakePhoto from "components/TakePhoto";

const HomePage = (): JSX.Element => {
    const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);

    return (
        <Layout>
            {!photo ? (
                <TakePhoto onPhoto={(file, url) => setPhoto({ file, url })} />
            ) : (
                <PhotoForm file={photo.file} url={photo.url} />
            )}
        </Layout>
    );
};

export default HomePage;

/*
//Leaving this here so that I don't have to keep looking up the syntax...
import { GetServerSidePropsContext } from "next/types";
export async function getServerSideProps(ctx: GetServerSidePropsContext): Promise<{ props: any }> {
    return {
        props: {  },
    };
}
*/
