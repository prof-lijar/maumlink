/** Wording of the 이어서/다시 question on the story list (read aloud; see narration inventory). */
export type StoryDialogMode = 'in_progress' | 'completed'

export const STORY_DIALOG_COPY: Record<
  StoryDialogMode,
  { title: string; body: string; primary: string; secondary: string }
> = {
  in_progress: {
    title: '이어서 할까요?',
    body: '이 이야기는 아직 하는 중이에요.',
    primary: '이어서 하기',
    secondary: '처음부터 다시 하기',
  },
  completed: {
    title: '다시 해볼까요?',
    body: '이 이야기는 이미 완료했어요.',
    primary: '처음부터 다시 하기',
    secondary: '아니요',
  },
}
