import { Card, H5, NoiseBackground } from "sparks-ui";
import { CredentialCardMenu } from "./CredentialMenu";

export const CredentialCard = ({
    title,
}: {
    title: string;
}) => (
    <Card className="w-full h-full max-w-lg p-0">
        <header className="relative h-auto p-4">
            <NoiseBackground shade="light" />
            <div className="relative justify-between flex">
                <H5>{title}</H5>
                <CredentialCardMenu />
            </div>
        </header>
    </Card>
)