export const FolderIcon = ({ className = "" }: { className?: string }) => <img src="/img/icons/folder-generic.png" alt="Folder" className={className} />;
export const FolderHomeIcon = ({ className = "" }: { className?: string }) => <img src="/img/icons/folder-home.png" alt="Home folder" className={className} />;
export const FolderDockIcon = ({ className = "" }: { className?: string }) => <img src="/img/icons/folder-dock.png" alt="Dock folder" className={className} />;
export const PdfIcon = ({ className = "" }: { className?: string }) => <img src="/img/icons/sf-icons/pdf.svg" alt="PDF file" className={className} />;
export const TxtIcon = ({ className = "" }: { className?: string }) => <img src="/img/icons/sf-icons/txt.svg" alt="Text file" className={className} />;
export const AudioIcon = ({ className = "" }: { className?: string }) => <img src="/img/icons/sf-icons/audio.svg" alt="Audio file" className={className} />;
export const VideoIcon = ({ className = "" }: { className?: string }) => <img src="/img/icons/sf-icons/mp4file.svg" alt="Video file" className={className} />;

export type DesktopIconItem = { id: string; name: string; icon: string };
type DesktopIconsProps = { apps: DesktopIconItem[]; onOpen: (id: string) => void };

export default function DesktopIcons({ apps, onOpen }: DesktopIconsProps) {
  return (
    <div className="desktop-icons" aria-label="Desktop">
      {apps.map((app) => (
        <button key={app.id} onClick={() => onOpen(app.id)} aria-label={`Open ${app.name}`}>
          <img src={app.icon} alt="" draggable={false} />
          <span>{app.name}</span>
        </button>
      ))}
      <a className="desktop-file" href="/files/resume.pdf" target="_blank" rel="noreferrer">
        <PdfIcon />
        <span>Resume.pdf</span>
      </a>
    </div>
  );
}
