import { BibleVersion, Book, DailyVerse, ReadingPlan } from './types';

export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: 'almeida', name: 'João Ferreira de Almeida', language: 'pt-BR' },
  { id: 'web', name: 'World English Bible', language: 'en-US' },
  { id: 'kjv', name: 'King James Version', language: 'en-GB' },
];

export const VERSES_OF_THE_DAY: DailyVerse[] = [
  { reference: "João 3:16", text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", bookId: "John", chapter: 3 },
  { reference: "Salmos 23:1", text: "O Senhor é o meu pastor, nada me faltará.", bookId: "Psalms", chapter: 23 },
  { reference: "Filipenses 4:13", text: "Posso todas as coisas naquele que me fortalece.", bookId: "Philippians", chapter: 4 },
  { reference: "Jeremias 29:11", text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.", bookId: "Jeremiah", chapter: 29 },
  { reference: "Romanos 8:28", text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.", bookId: "Romans", chapter: 8 },
  { reference: "Provérbios 3:5", text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.", bookId: "Proverbs", chapter: 3 },
  { reference: "Isaías 41:10", text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.", bookId: "Isaiah", chapter: 41 },
  { reference: "Mateus 11:28", text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.", bookId: "Matthew", chapter: 11 },
  { reference: "Josué 1:9", text: "Não to mandei eu? Esforça-te, e tem bom ânimo; não temas, nem te espantes; porque o Senhor teu Deus é contigo, por onde quer que andares.", bookId: "Joshua", chapter: 1 },
  { reference: "2 Timóteo 1:7", text: "Porque Deus não nos deu o espírito de temor, mas de fortaleza, e de amor, e de moderação.", bookId: "2 Timothy", chapter: 1 }
];

export const OLD_TESTAMENT: Book[] = [
  { name: 'Gênesis', id: 'Genesis', chapters: 50, testament: 'OT' },
  { name: 'Êxodo', id: 'Exodus', chapters: 40, testament: 'OT' },
  { name: 'Levítico', id: 'Leviticus', chapters: 27, testament: 'OT' },
  { name: 'Números', id: 'Numbers', chapters: 36, testament: 'OT' },
  { name: 'Deuteronômio', id: 'Deuteronomy', chapters: 34, testament: 'OT' },
  { name: 'Josué', id: 'Joshua', chapters: 24, testament: 'OT' },
  { name: 'Juízes', id: 'Judges', chapters: 21, testament: 'OT' },
  { name: 'Rute', id: 'Ruth', chapters: 4, testament: 'OT' },
  { name: '1 Samuel', id: '1 Samuel', chapters: 31, testament: 'OT' },
  { name: '2 Samuel', id: '2 Samuel', chapters: 24, testament: 'OT' },
  { name: '1 Reis', id: '1 Kings', chapters: 22, testament: 'OT' },
  { name: '2 Reis', id: '2 Kings', chapters: 25, testament: 'OT' },
  { name: '1 Crônicas', id: '1 Chronicles', chapters: 29, testament: 'OT' },
  { name: '2 Crônicas', id: '2 Chronicles', chapters: 36, testament: 'OT' },
  { name: 'Esdras', id: 'Ezra', chapters: 10, testament: 'OT' },
  { name: 'Neemias', id: 'Nehemiah', chapters: 13, testament: 'OT' },
  { name: 'Ester', id: 'Esther', chapters: 10, testament: 'OT' },
  { name: 'Jó', id: 'Job', chapters: 42, testament: 'OT' },
  { name: 'Salmos', id: 'Psalms', chapters: 150, testament: 'OT' },
  { name: 'Provérbios', id: 'Proverbs', chapters: 31, testament: 'OT' },
  { name: 'Eclesiastes', id: 'Ecclesiastes', chapters: 12, testament: 'OT' },
  { name: 'Cânticos', id: 'Song of Solomon', chapters: 8, testament: 'OT' },
  { name: 'Isaías', id: 'Isaiah', chapters: 66, testament: 'OT' },
  { name: 'Jeremias', id: 'Jeremiah', chapters: 52, testament: 'OT' },
  { name: 'Lamentações', id: 'Lamentations', chapters: 5, testament: 'OT' },
  { name: 'Ezequiel', id: 'Ezekiel', chapters: 48, testament: 'OT' },
  { name: 'Daniel', id: 'Daniel', chapters: 12, testament: 'OT' },
  { name: 'Oseias', id: 'Hosea', chapters: 14, testament: 'OT' },
  { name: 'Joel', id: 'Joel', chapters: 3, testament: 'OT' },
  { name: 'Amós', id: 'Amos', chapters: 9, testament: 'OT' },
  { name: 'Obadias', id: 'Obadiah', chapters: 1, testament: 'OT' },
  { name: 'Jonas', id: 'Jonah', chapters: 4, testament: 'OT' },
  { name: 'Miqueias', id: 'Micah', chapters: 7, testament: 'OT' },
  { name: 'Naum', id: 'Nahum', chapters: 3, testament: 'OT' },
  { name: 'Habacuque', id: 'Habakkuk', chapters: 3, testament: 'OT' },
  { name: 'Sofonias', id: 'Zephaniah', chapters: 3, testament: 'OT' },
  { name: 'Ageu', id: 'Haggai', chapters: 2, testament: 'OT' },
  { name: 'Zacarias', id: 'Zechariah', chapters: 14, testament: 'OT' },
  { name: 'Malaquias', id: 'Malachi', chapters: 4, testament: 'OT' },
];

export const NEW_TESTAMENT: Book[] = [
  { name: 'Mateus', id: 'Matthew', chapters: 28, testament: 'NT' },
  { name: 'Marcos', id: 'Mark', chapters: 16, testament: 'NT' },
  { name: 'Lucas', id: 'Luke', chapters: 24, testament: 'NT' },
  { name: 'João', id: 'John', chapters: 21, testament: 'NT' },
  { name: 'Atos', id: 'Acts', chapters: 28, testament: 'NT' },
  { name: 'Romanos', id: 'Romans', chapters: 16, testament: 'NT' },
  { name: '1 Coríntios', id: '1 Corinthians', chapters: 16, testament: 'NT' },
  { name: '2 Coríntios', id: '2 Corinthians', chapters: 13, testament: 'NT' },
  { name: 'Gálatas', id: 'Galatians', chapters: 6, testament: 'NT' },
  { name: 'Efésios', id: 'Ephesians', chapters: 6, testament: 'NT' },
  { name: 'Filipenses', id: 'Philippians', chapters: 4, testament: 'NT' },
  { name: 'Colossenses', id: 'Colossians', chapters: 4, testament: 'NT' },
  { name: '1 Tessalonicenses', id: '1 Thessalonians', chapters: 5, testament: 'NT' },
  { name: '2 Tessalonicenses', id: '2 Thessalonians', chapters: 3, testament: 'NT' },
  { name: '1 Timóteo', id: '1 Timothy', chapters: 6, testament: 'NT' },
  { name: '2 Timóteo', id: '2 Timothy', chapters: 4, testament: 'NT' },
  { name: 'Tito', id: 'Titus', chapters: 3, testament: 'NT' },
  { name: 'Filemom', id: 'Philemon', chapters: 1, testament: 'NT' },
  { name: 'Hebreus', id: 'Hebrews', chapters: 13, testament: 'NT' },
  { name: 'Tiago', id: 'James', chapters: 5, testament: 'NT' },
  { name: '1 Pedro', id: '1 Peter', chapters: 5, testament: 'NT' },
  { name: '2 Pedro', id: '2 Peter', chapters: 3, testament: 'NT' },
  { name: '1 João', id: '1 John', chapters: 5, testament: 'NT' },
  { name: '2 João', id: '2 John', chapters: 1, testament: 'NT' },
  { name: '3 João', id: '3 John', chapters: 1, testament: 'NT' },
  { name: 'Judas', id: 'Jude', chapters: 1, testament: 'NT' },
  { name: 'Apocalipse', id: 'Revelation', chapters: 22, testament: 'NT' },
];

export const ALL_BOOKS = [...OLD_TESTAMENT, ...NEW_TESTAMENT];

// Sample Reading Plan
export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'nt-90',
    title: 'Novo Testamento em 90 Dias',
    description: 'Leia todo o Novo Testamento em apenas 3 meses.',
    totalDays: 90,
    days: Array.from({ length: 90 }, (_, i) => {
      // Simplified Logic: Just iterate through NT chapters (approximate)
      // Real implementation would have a static map. This is a mockup generator.
      const ntChapters = NEW_TESTAMENT.flatMap(b => Array.from({length: b.chapters}, (_, c) => ({bookId: b.id, bookName: b.name, chapter: c + 1})));
      const readingsPerDay = Math.ceil(ntChapters.length / 90);
      const start = i * readingsPerDay;
      const end = start + readingsPerDay;
      return {
        day: i + 1,
        readings: ntChapters.slice(start, end)
      };
    })
  }
];