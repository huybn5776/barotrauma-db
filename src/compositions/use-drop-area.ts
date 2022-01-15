import { ref, onMounted, Ref, UnwrapRef } from 'vue';

import { fromEvent, tap, exhaustMap, Observable, merge, filter } from 'rxjs';

import { useUntilDestroyed } from '@compositions/use-until-destroyed';
import { getFilesFromDataTransfer } from '@utils/file-utils';

interface DropAreaOption {
  fileDropped: (filesMap: Record<string, File>) => void;
}

interface UseDropArea {
  dropTargetRef: Ref<HTMLElement | undefined>;
  dropOverlayRef: Ref<HTMLElement | undefined>;
  fileDragEnter: Ref<UnwrapRef<boolean>>;
}

export function useDropArea(option: DropAreaOption): UseDropArea {
  const dropTargetRef = ref<HTMLElement>();
  const dropOverlayRef = ref<HTMLElement>();
  const untilDestroyed = useUntilDestroyed();
  const fileDragEnter = ref(false);

  onMounted(() => {
    const targetElement = dropTargetRef.value;
    const overlayElement = dropOverlayRef.value;
    if (!targetElement || !overlayElement) {
      return;
    }

    fromEvent<DragEvent>(targetElement, 'dragenter')
      .pipe(
        tap(onDragEnter),
        exhaustMap((event) => getDragOutObservable(event, targetElement)),
        untilDestroyed(),
      )
      .subscribe(async (event) => {
        event.preventDefault();
        onDragLeave();
        if (event.dataTransfer?.files?.length) {
          const { dataTransfer } = event;
          const filesMap = await getFilesFromDataTransfer(dataTransfer, (fileName) => fileName.endsWith('.xml'));
          option.fileDropped(filesMap);
        }
      });

    fromEvent(overlayElement, 'dragover')
      .pipe(untilDestroyed())
      .subscribe((event) => event.preventDefault());
  });

  function onDragEnter(): void {
    fileDragEnter.value = true;
  }

  function onDragLeave(): void {
    fileDragEnter.value = false;
  }

  function getDragOutObservable(dragEnterEvent: DragEvent, targetElement: HTMLElement): Observable<DragEvent> {
    let enteredElement: EventTarget[] = [dragEnterEvent.target as HTMLElement];

    const dragEnter$ = fromEvent<DragEvent>(targetElement, 'dragenter');
    const dragLeave$ = merge(
      fromEvent<DragEvent>(targetElement, 'dragleave'),
      fromEvent<DragEvent>(targetElement, 'drop'),
    );
    const dragOut$ = merge(
      dragEnter$.pipe(tap((event) => event.target && enteredElement.push(event.target))),
      dragLeave$.pipe(tap((event) => (enteredElement = enteredElement.filter((e) => e !== event.target)))),
    ).pipe(filter(() => !enteredElement.length));

    return dragOut$.pipe(untilDestroyed());
  }

  return { dropTargetRef, dropOverlayRef, fileDragEnter };
}
