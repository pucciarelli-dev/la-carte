export interface EditorCategoryBase {
  id: string;
  name: string;
  nameEn?: string;
  order: number;
  visible: boolean;
  backgroundColor?: string | null;
  textColor?: string | null;
  footerImageUrl?: string | null;
}
