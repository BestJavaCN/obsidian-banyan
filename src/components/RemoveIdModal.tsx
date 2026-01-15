import { App, Modal } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import BanyanPlugin from "src/main";
import { i18n } from "src/utils/i18n";

interface CandidateItem {
    path: string;
    id: any;
    selected: boolean;
    done?: boolean;
    ok?: boolean;
}

interface RemoveIdModalProps {
    app: App;
    plugin: BanyanPlugin;
}

export class RemoveIdModal extends Modal {
    props: RemoveIdModalProps;
    root: Root | null = null;

    constructor(app: App, props: RemoveIdModalProps) {
        super(app);
        this.props = props;
    }

    onOpen() {
        const modalEl = this.containerEl.children[1] as HTMLElement;
        modalEl.addClass('confirm-modal');
        modalEl.addClass('migrate-modal');
        // 禁用点击遮罩关闭
        this.containerEl.onclick = (e) => { e.stopPropagation(); };
        (this as any).shouldRestoreSelection = false;
        this.root = createRoot(modalEl);
        this.root.render(
            <React.StrictMode>
                <RemoveIdContainer app={this.props.app} plugin={this.props.plugin} close={() => this.close()} />
            </React.StrictMode>
        );
    }

    onClose() {
        this.root?.unmount();
    }
}

export const openRemoveIdModal = ({ app, plugin }: { app: App, plugin: BanyanPlugin }) => {
    const modal = new RemoveIdModal(app, { app, plugin });
    modal.open();
}

const RemoveIdContainer = ({ app, plugin, close }: { app: App, plugin: BanyanPlugin, close: () => void }) => {
    const [loading, setLoading] = React.useState(true);
    const [running, setRunning] = React.useState(false);
    const [items, setItems] = React.useState<CandidateItem[]>([]);
    const [successCount, setSuccessCount] = React.useState(0);
    const [finishedCount, setFinishedCount] = React.useState(0);
    const [ran, setRan] = React.useState(false);

    React.useEffect(() => {
        const list = plugin.fileUtils.getFilesWithFrontmatterId();
        const candidates: CandidateItem[] = list.map(({ file, id }) => ({ path: file.path, id, selected: true }));
        setItems(candidates);
        setLoading(false);
    }, [plugin]);

    const toggleAll = (checked: boolean) => {
        setItems(prev => prev.map(it => ({ ...it, selected: checked })));
    };

    const start = async () => {
        if (running) return;
        setRunning(true);
        setSuccessCount(0);
        setFinishedCount(0);
        const selected = items.filter(it => it.selected);
        await plugin.fileUtils.removeFrontmatterId(
            selected.map(it => {
                const file = app.vault.getFileByPath(it.path);
                return { file: file! };
            }),
            (originalPath, file, ok) => {
                setItems(prev => {
                    const idx = prev.findIndex(x => x.path === originalPath);
                    if (idx < 0) return prev;
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], done: true, ok };
                    return updated;
                });
                setFinishedCount(c => c + 1);
                if (ok) setSuccessCount(c => c + 1);
            }
        );
        setRunning(false);
        setRan(true);
    };

    const totalSelected = items.filter(it => it.selected).length;
    const selectAllRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
        if (!selectAllRef.current) return;
        const el = selectAllRef.current;
        el.indeterminate = totalSelected > 0 && totalSelected < items.length;
    }, [totalSelected, items.length]);

    return <div className="confirm-container migrate-container">
        <div className="confirm-title">{i18n.t('remove_id_modal_title')}</div>
        <div className="confirm-desc">{i18n.t('remove_id_modal_desc')}</div>
        <div className="migrate-toolbar">
            {!ran && items.length > 0 && (
                <>
                    <label className="migrate-select-all">
                        <input type="checkbox"
                            ref={selectAllRef}
                            checked={totalSelected === items.length && items.length > 0}
                            onChange={(e) => toggleAll((e.target as HTMLInputElement).checked)} />
                        <span>{i18n.t('migrate_select_all')}</span>
                    </label>
                    <span className="migrate-count">{i18n.t('migrate_selected_count', { count: totalSelected.toString(), total: items.length.toString() })}</span>
                    <button disabled={loading || running || totalSelected === 0} className="confirm-btn-confirm" onClick={start}>{i18n.t('remove_id_start')}</button>
                </>
            )}
            {ran && (
                <>
                    <button disabled={running} onClick={async () => {
                        setLoading(true);
                        setRan(false);
                        setSuccessCount(0);
                        setFinishedCount(0);
                        const list = plugin.fileUtils.getFilesWithFrontmatterId();
                        const candidates: CandidateItem[] = list.map(({ file, id }) => ({ path: file.path, id, selected: true }));
                        setItems(candidates);
                        setLoading(false);
                    }}>{i18n.t('migrate_rescan')}</button>
                </>
            )}
            <button disabled={running} onClick={close}>{i18n.t('migrate_close')}</button>
            {(running || ran) && <span className="migrate-progress">{i18n.t('migrate_progress', { done: finishedCount.toString(), total: totalSelected.toString(), success: successCount.toString() })}</span>}
        </div>
        {items.length === 0 ? (
            <div className="migrate-empty">{i18n.t('remove_id_empty_list')}</div>
        ) : (
            <div className="migrate-list">
                {items.map((it, idx) => (
                    <div className="migrate-item" key={it.path}>
                        {!ran && <input type="checkbox" disabled={running} checked={it.selected} onChange={(e) => {
                            const checked = (e.target as HTMLInputElement).checked;
                            setItems(prev => {
                                const updated = [...prev];
                                updated[idx] = { ...updated[idx], selected: checked };
                                return updated;
                            });
                        }} />}
                        {ran ? <span className="migrate-row-placeholder" /> : null}
                        <span className="migrate-path">{it.path}</span>
                        <span className="migrate-arrow">→</span>
                        <span className="migrate-title">ID: {it.id}</span>
                        <span className="migrate-status-cell">{it.done ? (it.ok ? '✅' : '❌') : ''}</span>
                    </div>
                ))}
            </div>
        )}
    </div>;
}
