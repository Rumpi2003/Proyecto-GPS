import { useEffect, useRef } from 'react';
import { Wrapper, Status } from "@googlemaps/react-wrapper";

const render = (status) => {
    return <div>{status}</div>;
}

function Map({ center, zoom }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!window.google || !ref.current) return;
        new window.google.maps.Map(ref.current, {
            center,
            zoom,
        });
    }, [center, zoom]);

    return <div ref={ref} style={{ width: '100%', height: '500px' }} />;
}

export default function GoogleMap() {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    return (
        <Wrapper apiKey={apiKey} render={render}>
            <Map center={{ lat: -36.82319530467122, lng: -73.01204075092664 }} zoom={14} />
        </Wrapper>
    );
}