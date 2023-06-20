import { useLocation } from "react-router-dom";
import { SparksFoundation } from "./SparksFoundation";
import { Card } from "sparks-ui";

export const WebsiteChannels = () => {
    const location = useLocation()
    const request = location?.state?.prev?.params?.connect
    const waiting = request === 'SparksFoundation'

    return (
        <Card>
            <SparksFoundation connectionWaiting={waiting} />
        </Card>
    )
}
