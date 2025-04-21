import PlaylistContent from './components/PlaylistContent';

export default function PlaylistPage({ params }: { params: { id: string } }) {
    return <PlaylistContent id={params.id} />;
} 