/* Python kursi — 2-qism: comprehension, funksiyalar, xatolar, fayllar, modullar, OOP, professional mavzular (15–26-darslar) */
window.COURSE = window.COURSE || [];
window.COURSE.push(
  {
    id: 15, module: 3, title: "Comprehension: qisqa va chiroyli kod", minutes: 15,
    intro: "List, dict va set comprehension — sikl va shartni bitta qatorga jamlab, yangi to'plam yaratishning \"pythoncha\" usuli.",
    sections: [
      {
        h: 'List comprehension',
        html: "<p>Shakli: <code>[ifoda for element in ketma_ketlik if shart]</code>. Oddiy sikldan qisqaroq va tezroq.</p>",
        code: String.raw`# Oddiy usul
kvadratlar = []
for x in range(1, 6):
    kvadratlar.append(x * x)
print(kvadratlar)

# Comprehension
print([x * x for x in range(1, 6)])
print([x for x in range(20) if x % 3 == 0])
print([s.upper() for s in ["olma", "nok"]])`,
      },
      {
        h: 'Shart bilan qiymatni tanlash',
        html: "<p>Agar har bir element uchun ikki xil qiymat kerak bo'lsa, <code>if ... else</code> ifoda qismida yoziladi.</p>",
        code: String.raw`sonlar = [5, -3, 8, -1]
print(["+" if x > 0 else "-" for x in sonlar])
print([abs(x) for x in sonlar])`,
      },
      {
        h: 'dict va set comprehension',
        html: "<p>Figurali qavs bilan lug'at yoki to'plam yaratiladi.</p>",
        code: String.raw`sozlar = ["olma", "nok", "uzum", "anor"]
print({s: len(s) for s in sozlar})
print({len(s) for s in sozlar})
ballar = {"Ali": 82, "Gul": 95, "Vali": 61}
print({ism: b for ism, b in ballar.items() if b >= 70})`,
      },
    ],
    quiz: [
      { q: '[x * 2 for x in range(3)] natijasi?', options: ['[0, 2, 4]', '[2, 4, 6]', '[0, 1, 2]', '[1, 2, 3]'], answer: 0, explain: 'x = 0, 1, 2.' },
      { q: '{x % 3 for x in range(10)} natijasi?', options: ['{0, 1, 2}', '[0, 1, 2]', '{0,...,9}', 'xato'], answer: 0, explain: "Set — takrorlarsiz qoldiqlar." },
    ],
    tasks: [
      {
        title: 'Juft kvadratlar',
        desc: "<code>juft_kvadratlar</code> o'zgaruvchisiga 1 dan 20 gacha juft sonlarning kvadratlarini <b>bitta comprehension</b> bilan yozing.",
        starter: String.raw`juft_kvadratlar =
print(juft_kvadratlar)`,
        tests: String.raw`assert juft_kvadratlar == [x * x for x in range(2, 21, 2)], "Natija [4, 16, 36, ..., 400] bo'lsin"
assert "for" in __code__.split("juft_kvadratlar =")[1].split("\n")[0], "Comprehension bir qatorda yozilsin"`,
        hint: 'juft_kvadratlar = [x * x for x in range(1, 21) if x % 2 == 0]',
      },
      {
        title: "So'z uzunliklari",
        desc: "<code>uzunliklar(matn)</code> har bir so'z va uning uzunligidan iborat lug'at qaytarsin (dict comprehension bilan).",
        starter: String.raw`def uzunliklar(matn):
    pass

print(uzunliklar("men python organaman"))`,
        tests: String.raw`assert uzunliklar("men python organaman") == {"men": 3, "python": 6, "organaman": 9}`,
        hint: 'return {s: len(s) for s in matn.split()}',
      },
    ],
  },

  // ======================= 4-MODUL =======================
  {
    id: 16, module: 4, title: 'Funksiyalar asoslari', minutes: 20,
    intro: "Funksiya — nom berilgan, qayta ishlatiladigan kod bloki. Katta dasturlarni kichik, tushunarli qismlarga bo'lishning asosiy vositasi.",
    sections: [
      {
        h: 'def va return',
        html: "<p>Funksiya <code>def</code> bilan e'lon qilinadi. <code>return</code> natijani qaytaradi va funksiyani tugatadi. <code>return</code> bo'lmasa, funksiya <code>None</code> qaytaradi.</p>",
        code: String.raw`def salomlash(ism):
    return f"Salom, {ism}!"

def kvadrat(x):
    return x * x

print(salomlash("Gulnoza"))
print(kvadrat(7) + kvadrat(2))`,
      },
      {
        h: 'print va return farqi',
        html: "<p><code>print</code> faqat ekranga chiqaradi, <code>return</code> esa qiymatni dasturga qaytaradi — uni o'zgaruvchiga saqlash, boshqa hisobda ishlatish mumkin.</p>",
        code: String.raw`def chop_et(x):
    print(x * 2)

def qaytar(x):
    return x * 2

a = chop_et(5)    # 10 chiqadi, lekin a = None
b = qaytar(5)     # hech narsa chiqmaydi, b = 10
print("a =", a, "| b =", b)`,
      },
      {
        h: 'Hujjatlashtirish (docstring)',
        html: "<p>Funksiya boshidagi uch qo'shtirnoqli matn — <b>docstring</b>. U funksiya nima qilishini tushuntiradi va <code>help()</code> da ko'rinadi.</p>",
        code: String.raw`def ortacha(sonlar):
    """Ro'yxatdagi sonlarning o'rtacha qiymatini qaytaradi."""
    if not sonlar:
        return 0
    return sum(sonlar) / len(sonlar)

print(ortacha([4, 5, 3]))
print(ortacha.__doc__)`,
      },
      {
        h: 'Funksiyalar bir-birini chaqiradi',
        html: "<p>Murakkab vazifani kichik funksiyalarga bo'lish kodni o'qish va tekshirishni osonlashtiradi.</p>",
        code: String.raw`def tubmi(n):
    return n > 1 and all(n % d for d in range(2, int(n ** 0.5) + 1))

def tublar(chegara):
    return [n for n in range(chegara) if tubmi(n)]

print(tublar(40))`,
      },
    ],
    quiz: [
      { q: "return bo'lmagan funksiya nima qaytaradi?", options: ['0', '""', 'None', 'xato'], answer: 2, explain: 'Standart qiymat — None.' },
      { q: "Funksiya qaysi kalit so'z bilan e'lon qilinadi?", options: ['func', 'function', 'def', 'fn'], answer: 2, explain: 'def.' },
    ],
    tasks: [
      {
        title: 'Selsiydan Farengeytga',
        desc: "<code>farengeyt(c)</code> funksiyasi selsiyni farengeytga aylantirsin: F = C × 9/5 + 32.",
        starter: String.raw`def farengeyt(c):
    pass

print(farengeyt(100))`,
        tests: String.raw`assert farengeyt(0) == 32 and farengeyt(100) == 212, "0 → 32, 100 → 212"
assert abs(farengeyt(36.6) - 97.88) < 0.01`,
        hint: 'return c * 9 / 5 + 32',
      },
      {
        title: 'Unli harflar',
        desc: "<code>unlilar_soni(s)</code> satrdagi unli harflar (<code>a e i o u</code>, katta-kichik) sonini qaytarsin.",
        starter: String.raw`def unlilar_soni(s):
    pass

print(unlilar_soni("Assalomu alaykum"))`,
        tests: String.raw`assert unlilar_soni("Assalomu alaykum") == 7
assert unlilar_soni("") == 0 and unlilar_soni("BCD") == 0 and unlilar_soni("AEIOU") == 5`,
        hint: 'return sum(1 for h in s.lower() if h in "aeiou")',
      },
    ],
  },
  {
    id: 17, module: 4, title: "Parametrlar: standart qiymat, *args, **kwargs, ko'rinish sohasi", minutes: 20,
    intro: "Funksiyalarni moslashuvchan qilish: standart qiymatli parametrlar, nomli argumentlar, cheksiz argumentlar va o'zgaruvchilarning ko'rinish sohasi.",
    sections: [
      {
        h: 'Standart qiymat va nomli argumentlar',
        html: "<p>Parametrga standart qiymat berilsa, uni chaqirishda tashlab ketish mumkin. Argumentlarni nomi bilan ham berish mumkin — tartib ahamiyatsiz bo'ladi.</p>",
        code: String.raw`def daraja(asos, korsatkich=2):
    return asos ** korsatkich

print(daraja(5))           # 25
print(daraja(2, 10))       # 1024
print(daraja(korsatkich=3, asos=4))`,
      },
      {
        h: '*args va **kwargs',
        html: "<p><code>*args</code> — istalgancha pozitsion argument (tuple bo'lib keladi), <code>**kwargs</code> — istalgancha nomli argument (lug'at bo'lib keladi).</p>",
        code: String.raw`def yigindi(*sonlar):
    return sum(sonlar)

def profil(ism, **malumot):
    print(ism)
    for k, v in malumot.items():
        print(f"  {k}: {v}")

print(yigindi(1, 2, 3, 4))
profil("Laylo", yosh=19, shahar="Samarqand")`,
      },
      {
        h: "⚠ O'zgaruvchan standart qiymat tuzog'i",
        html: "<p>Standart qiymat funksiya e'lon qilinganda <b>bir marta</b> yaratiladi. Shuning uchun <code>def f(l=[])</code> xavfli — o'rniga <code>None</code> ishlating.</p>",
        code: String.raw`def yomon(x, l=[]):
    l.append(x)
    return l

def yaxshi(x, l=None):
    if l is None:
        l = []
    l.append(x)
    return l

print(yomon(1), yomon(2))    # [1, 2] [1, 2] — kutilmagan!
print(yaxshi(1), yaxshi(2))  # [1] [2]`,
      },
      {
        h: "Ko'rinish sohasi (scope)",
        html: "<p>Funksiya ichida yaratilgan o'zgaruvchi — <b>lokal</b>, tashqarida ko'rinmaydi. Global o'zgaruvchini o'zgartirish uchun <code>global</code> kerak (lekin undan kam foydalaning — qiymatni qaytargan ma'qul).</p>",
        code: String.raw`hisob = 0

def oshir():
    global hisob
    hisob += 1

def lokal():
    x = 100      # faqat shu funksiya ichida
    return x

oshir(); oshir()
print(hisob, lokal())`,
      },
    ],
    quiz: [
      { q: 'def f(*a): return len(a); f(1, 2, 3)?', options: ['1', '3', '(1, 2, 3)', 'xato'], answer: 1, explain: "a = (1, 2, 3) — tuple." },
      { q: '**kwargs qanday turda keladi?', options: ['list', 'tuple', 'dict', 'set'], answer: 2, explain: "Nomli argumentlar lug'atga yig'iladi." },
    ],
    tasks: [
      {
        title: 'Moslashuvchan salom',
        desc: "<code>salom(ism, til=\"uz\")</code>: <code>uz</code> → <code>Salom, Ali!</code>, <code>en</code> → <code>Hello, Ali!</code>, <code>ru</code> → <code>Привет, Ali!</code>.",
        starter: String.raw`def salom(ism, til="uz"):
    pass

print(salom("Ali"))`,
        tests: String.raw`assert salom("Ali") == "Salom, Ali!"
assert salom("Ali", "en") == "Hello, Ali!"
assert salom("Ali", til="ru") == "Привет, Ali!"`,
        hint: 'sozlar = {"uz": "Salom", "en": "Hello", "ru": "Привет"}\nreturn f"{sozlar[til]}, {ism}!"',
      },
      {
        title: "O'rtacha (*args)",
        desc: "<code>ortacha(*sonlar)</code> istalgancha sonning o'rtachasini qaytarsin; son berilmasa <code>0</code>.",
        starter: String.raw`def ortacha(*sonlar):
    pass

print(ortacha(4, 5, 6))`,
        tests: String.raw`assert ortacha(4, 5, 6) == 5
assert ortacha() == 0
assert ortacha(1, 2) == 1.5`,
        hint: 'return sum(sonlar) / len(sonlar) if sonlar else 0',
      },
    ],
  },
  {
    id: 18, module: 4, title: 'lambda, map, filter, sorted va rekursiya', minutes: 20,
    intro: "Funksiyalar ham qiymat: ularni boshqa funksiyaga berish mumkin. Qisqa lambda funksiyalar va o'zini o'zi chaqiruvchi rekursiv funksiyalarni o'rganamiz.",
    sections: [
      {
        h: 'lambda',
        html: "<p><code>lambda argumentlar: ifoda</code> — nomsiz, bir qatorli funksiya. Ko'pincha <code>sorted</code>, <code>map</code>, <code>filter</code> bilan ishlatiladi.</p>",
        code: String.raw`kvadrat = lambda x: x * x
print(kvadrat(9))

talabalar = [("Ali", 82), ("Gul", 95), ("Vali", 61)]
print(sorted(talabalar, key=lambda t: t[1], reverse=True))
print(max(talabalar, key=lambda t: t[1]))`,
      },
      {
        h: 'map va filter',
        html: "<p><code>map(f, l)</code> — har bir elementga funksiyani qo'llaydi, <code>filter(f, l)</code> — shartga mos elementlarni qoldiradi. Natijani <code>list()</code> bilan ro'yxatga aylantiring.</p>",
        code: String.raw`sonlar = ["3", "8", "15"]
print(list(map(int, sonlar)))
print(list(filter(lambda x: x % 2, range(10))))
print(sum(map(len, ["olma", "nok"])))`,
      },
      {
        h: 'Rekursiya',
        html: "<p>Rekursiv funksiya o'zini chaqiradi. Unda albatta <b>to'xtash sharti</b> (asos holat) bo'lishi kerak.</p>",
        code: String.raw`def faktorial(n):
    if n <= 1:          # asos holat
        return 1
    return n * faktorial(n - 1)

def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(faktorial(6), [fib(i) for i in range(10)])`,
      },
      {
        h: 'Xotirada saqlash (memoizatsiya)',
        html: "<p>Oddiy <code>fib</code> bir xil qiymatlarni qayta-qayta hisoblaydi. <code>functools.lru_cache</code> natijalarni eslab qoladi va funksiyani juda tezlashtiradi.</p>",
        code: String.raw`from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(100))`,
      },
    ],
    quiz: [
      { q: 'list(map(lambda x: x + 1, [1, 2]))?', options: ['[1, 2]', '[2, 3]', '[1, 2, 1]', 'xato'], answer: 1, explain: 'Har bir elementga 1 qo\'shiladi.' },
      { q: "Rekursiyada eng muhim narsa?", options: ['global o\'zgaruvchi', "to'xtash sharti", 'lambda', 'print'], answer: 1, explain: "Asos holat bo'lmasa, cheksiz rekursiya bo'ladi." },
    ],
    tasks: [
      {
        title: "Uzunlik bo'yicha saralash",
        desc: "<code>saralash(sozlar)</code> so'zlarni uzunligi bo'yicha, uzunligi teng bo'lsa alifbo bo'yicha saralasin.",
        starter: String.raw`def saralash(sozlar):
    pass

print(saralash(["nok", "olma", "uzum", "ol", "anor"]))`,
        tests: String.raw`assert saralash(["nok", "olma", "uzum", "ol", "anor"]) == ["ol", "nok", "anor", "olma", "uzum"]`,
        hint: 'return sorted(sozlar, key=lambda s: (len(s), s))',
      },
      {
        title: "Raqamlar yig'indisi (rekursiv)",
        desc: "<code>raqam_yigindi(n)</code> sonning raqamlari yig'indisini <b>rekursiya</b> bilan hisoblasin (sikl ishlatmang).",
        starter: String.raw`def raqam_yigindi(n):
    pass

print(raqam_yigindi(9875))`,
        tests: String.raw`assert "for " not in __code__ and "while " not in __code__, "Sikl ishlatmang — rekursiya bilan yozing"
for n, e in [(9875, 29), (0, 0), (7, 7), (1001, 2)]:
    assert raqam_yigindi(n) == e, f"raqam_yigindi({n}) = {e}"`,
        hint: 'if n < 10:\n    return n\nreturn n % 10 + raqam_yigindi(n // 10)',
      },
    ],
  },

  // ======================= 5-MODUL =======================
  {
    id: 19, module: 5, title: 'Xatolar bilan ishlash: try, except, raise', minutes: 18,
    intro: "Dastur xato bilan to'xtab qolmasligi kerak. Istisnolarni (exception) ushlash, o'z xatolaringizni chiqarish va xatoli kodni o'qishni o'rganamiz.",
    sections: [
      {
        h: 'Xato xabarini o\'qish',
        html: "<p>Xato chiqqanda Python <b>traceback</b> ko'rsatadi: qaysi faylda, qaysi qatorda va qanday xato. Eng pastki qator — xato turi va tavsifi. Masalan: <code>ZeroDivisionError</code>, <code>ValueError</code>, <code>KeyError</code>, <code>IndexError</code>, <code>TypeError</code>, <code>NameError</code>.</p>",
        code: String.raw`sonlar = [1, 2, 3]
print(sonlar[5])   # IndexError`,
      },
      {
        h: 'try / except',
        html: "<p>Xato chiqishi mumkin bo'lgan kod <code>try</code> ichiga yoziladi, xato bo'lsa <code>except</code> bloki ishlaydi. Har doim aniq xato turini ushlang.</p>",
        code: String.raw`def xavfsiz_bolish(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        print("Nolga bo'lib bo'lmaydi!")
        return None

print(xavfsiz_bolish(10, 2))
print(xavfsiz_bolish(10, 0))`,
      },
      {
        h: 'else, finally va bir nechta except',
        html: "<p><code>else</code> — xato bo'lmasa ishlaydi, <code>finally</code> — har doim ishlaydi (masalan, faylni yopish uchun).</p>",
        code: String.raw`for qiymat in ["42", "abc", "0"]:
    try:
        son = int(qiymat)
        natija = 100 / son
    except ValueError:
        print(qiymat, "→ son emas")
    except ZeroDivisionError as e:
        print(qiymat, "→ xato:", e)
    else:
        print(qiymat, "→", natija)
    finally:
        print("  (tekshiruv tugadi)")`,
      },
      {
        h: "raise — o'z xatoingizni chiqarish",
        html: "<p>Noto'g'ri ma'lumot kelsa, funksiya <code>raise</code> bilan xato chiqarishi kerak. O'z xato sinfingizni ham yaratish mumkin.</p>",
        code: String.raw`class YoshXatosi(ValueError):
    pass

def yosh_tekshir(yosh):
    if not 0 <= yosh <= 150:
        raise YoshXatosi(f"Yosh noto'g'ri: {yosh}")
    return yosh

try:
    yosh_tekshir(200)
except YoshXatosi as e:
    print("Ushlandi:", e)`,
      },
    ],
    quiz: [
      { q: 'int("abc") qanday xato beradi?', options: ['TypeError', 'ValueError', 'NameError', 'KeyError'], answer: 1, explain: "Tur to'g'ri (str), lekin qiymat noto'g'ri." },
      { q: 'finally bloki qachon ishlaydi?', options: ['Faqat xato bo\'lsa', "Faqat xato bo'lmasa", 'Har doim', 'Hech qachon'], answer: 2, explain: 'finally har doim bajariladi.' },
    ],
    tasks: [
      {
        title: 'Xavfsiz son',
        desc: "<code>xavfsiz_int(s, standart=0)</code> satrni butun songa aylantirsin; aylantirib bo'lmasa <code>standart</code> qaytarsin.",
        starter: String.raw`def xavfsiz_int(s, standart=0):
    pass

print(xavfsiz_int("12"), xavfsiz_int("salom"), xavfsiz_int("x", -1))`,
        tests: String.raw`assert xavfsiz_int("12") == 12 and xavfsiz_int(" 7 ") == 7
assert xavfsiz_int("salom") == 0 and xavfsiz_int("x", -1) == -1 and xavfsiz_int("3.5") == 0`,
        hint: 'try:\n    return int(s)\nexcept ValueError:\n    return standart',
      },
      {
        title: 'Bank hisobi',
        desc: "<code>yechish(balans, summa)</code>: summa musbat bo'lmasa <code>ValueError</code>, balansdan ko'p bo'lsa <code>ValueError(\"Mablag' yetarli emas\")</code> chiqarsin, aks holda yangi balansni qaytarsin.",
        starter: String.raw`def yechish(balans, summa):
    pass

print(yechish(1000, 300))`,
        tests: String.raw`assert yechish(1000, 300) == 700
for b, s in [(100, 500), (100, -5), (100, 0)]:
    try:
        yechish(b, s)
    except ValueError:
        pass
    else:
        raise AssertionError(f"yechish({b}, {s}) ValueError chiqarishi kerak")`,
        hint: "if summa <= 0:\n    raise ValueError(\"Summa musbat bo'lishi kerak\")\nif summa > balans:\n    raise ValueError(\"Mablag' yetarli emas\")\nreturn balans - summa",
      },
    ],
  },
  {
    id: 20, module: 5, title: 'Fayllar bilan ishlash', minutes: 18,
    intro: "Ma'lumotni faylga saqlash va o'qish: matnli fayllar, with operatori, CSV va JSON formatlari. (Brauzerda fayllar vaqtinchalik xotirada yaratiladi.)",
    sections: [
      {
        h: 'Yozish va o\'qish',
        html: "<p><code>open(nom, rejim)</code>: <code>\"w\"</code> — yozish (eskisini o'chiradi), <code>\"a\"</code> — oxiriga qo'shish, <code>\"r\"</code> — o'qish. <code>with</code> faylni avtomatik yopadi. O'zbekcha harflar uchun <code>encoding=\"utf-8\"</code> yozing.</p>",
        code: String.raw`with open("eslatma.txt", "w", encoding="utf-8") as f:
    f.write("Birinchi qator\n")
    f.write("Ikkinchi qator — o'zbekcha\n")

with open("eslatma.txt", "a", encoding="utf-8") as f:
    f.write("Qo'shilgan qator\n")

with open("eslatma.txt", encoding="utf-8") as f:
    for i, qator in enumerate(f, 1):
        print(i, qator.rstrip())`,
      },
      {
        h: 'JSON — ma\'lumotlarni saqlash formati',
        html: "<p>JSON lug'at va ro'yxatlarni matn ko'rinishida saqlaydi. Veb-dasturlashda eng ko'p ishlatiladigan format.</p>",
        code: String.raw`import json

kitoblar = [{"nom": "O'tkan kunlar", "muallif": "A. Qodiriy", "yil": 1925}]
with open("kitoblar.json", "w", encoding="utf-8") as f:
    json.dump(kitoblar, f, ensure_ascii=False, indent=2)

with open("kitoblar.json", encoding="utf-8") as f:
    data = json.load(f)
print(data[0]["nom"], data[0]["yil"])
print(json.dumps({"a": 1, "b": [1, 2]}))`,
      },
      {
        h: 'CSV — jadval fayllari',
        html: "<p>Excel kabi jadvallar ko'pincha CSV (vergul bilan ajratilgan) formatda saqlanadi.</p>",
        code: String.raw`import csv

with open("baholar.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["ism", "ball"])
    w.writerows([["Ali", 85], ["Gul", 92]])

with open("baholar.csv", encoding="utf-8") as f:
    for qator in csv.DictReader(f):
        print(qator["ism"], int(qator["ball"]))`,
      },
    ],
    quiz: [
      { q: '"w" rejimi mavjud faylga nima qiladi?', options: ["Oxiriga qo'shadi", "Mazmunini o'chirib, qaytadan yozadi", "Xato beradi", "Faqat o'qiydi"], answer: 1, explain: "Oxiriga qo'shish uchun \"a\"." },
      { q: 'with open(...) as f nima uchun yaxshi?', options: ['Tezroq', 'Faylni avtomatik yopadi', 'Faylni shifrlaydi', 'Farqi yo\'q'], answer: 1, explain: "Xato bo'lsa ham fayl yopiladi." },
    ],
    tasks: [
      {
        title: "Qatorlar soni",
        desc: "<code>qatorlar_soni(fayl)</code> fayldagi bo'sh bo'lmagan qatorlar sonini qaytarsin.",
        starter: String.raw`def qatorlar_soni(fayl):
    pass

with open("test.txt", "w") as f:
    f.write("bir\n\nikki\nuch\n")
print(qatorlar_soni("test.txt"))`,
        tests: String.raw`with open("_t.txt", "w") as f:
    f.write("a\n\n  \nb\nc\n")
assert qatorlar_soni("_t.txt") == 3, "a, b, c — 3 ta bo'sh bo'lmagan qator"`,
        hint: 'with open(fayl, encoding="utf-8") as f:\n    return sum(1 for q in f if q.strip())',
      },
      {
        title: 'JSON saqlash',
        desc: "<code>saqlash(fayl, data)</code> lug'atni JSON qilib yozsin, <code>yuklash(fayl)</code> esa o'qib qaytarsin.",
        starter: String.raw`import json

def saqlash(fayl, data):
    pass

def yuklash(fayl):
    pass

saqlash("user.json", {"ism": "Ali", "ball": [5, 4]})
print(yuklash("user.json"))`,
        tests: String.raw`d = {"ism": "Gulnoza", "yosh": 20, "fanlar": ["matem", "fizika"]}
saqlash("_u.json", d)
assert yuklash("_u.json") == d, "Saqlangan va o'qilgan ma'lumot bir xil bo'lsin"`,
        hint: 'with open(fayl, "w", encoding="utf-8") as f:\n    json.dump(data, f)\n...\nwith open(fayl, encoding="utf-8") as f:\n    return json.load(f)',
      },
    ],
  },
  {
    id: 21, module: 5, title: 'Modullar va standart kutubxona', minutes: 18,
    intro: "Python \"batareyalari bilan\" keladi: matematika, tasodifiy sonlar, sana-vaqt va boshqa yuzlab tayyor modullar. import qilishni va o'z modulingizni yaratishni o'rganamiz.",
    sections: [
      {
        h: 'import usullari',
        html: "<ul><li><code>import math</code> — <code>math.sqrt(16)</code></li><li><code>from math import sqrt, pi</code> — to'g'ridan-to'g'ri <code>sqrt(16)</code></li><li><code>import datetime as dt</code> — qisqa nom (taxallus)</li></ul>",
        code: String.raw`import math
from math import pi, sqrt
print(math.factorial(10), sqrt(81), round(pi, 4))
print(math.gcd(48, 18), math.ceil(4.1), math.floor(4.9))`,
      },
      {
        h: 'random',
        html: "<p>O'yinlar, test ma'lumotlari va tasodifiy tanlov uchun.</p>",
        code: String.raw`import random
print(random.randint(1, 6))           # zar
print(random.choice(["tosh", "qaychi", "qog'oz"]))
l = list(range(10))
random.shuffle(l)
print(l, random.sample(l, 3))`,
      },
      {
        h: 'datetime',
        html: "<p>Sana va vaqt bilan ishlash.</p>",
        code: String.raw`from datetime import date, datetime, timedelta
bugun = date.today()
print(bugun, bugun.year)
yangi_yil = date(bugun.year + 1, 1, 1)
print("Yangi yilgacha:", (yangi_yil - bugun).days, "kun")
print((datetime.now() + timedelta(hours=3)).strftime("%H:%M"))`,
      },
      {
        h: "O'z modulingiz",
        html: "<p>Har bir <code>.py</code> fayl — modul. <b>PyCharm Online</b>da <code>utils.py</code> yarating va boshqa fayldan <code>from utils import ...</code> qiling. <code>if __name__ == \"__main__\":</code> bloki fayl to'g'ridan-to'g'ri ishga tushirilgandagina bajariladi.</p>",
        code: String.raw`# Modulning ichidagilarini ko'rish
import string
print(string.ascii_lowercase)
print([n for n in dir(string) if not n.startswith("_")][:8])
print(__name__)`,
      },
    ],
    quiz: [
      { q: 'from math import sqrt dan keyin qanday chaqiriladi?', options: ['math.sqrt(9)', 'sqrt(9)', 'math->sqrt(9)', 'import sqrt(9)'], answer: 1, explain: "Funksiya to'g'ridan-to'g'ri import qilindi." },
      { q: 'random.randint(1, 3) qaysi qiymatlarni qaytaradi?', options: ['1, 2', '1, 2, 3', '0, 1, 2', '1.0 — 3.0'], answer: 1, explain: 'randint ikkala chegarani ham o\'z ichiga oladi.' },
    ],
    tasks: [
      {
        title: 'Aylana',
        desc: "<code>aylana(r)</code> funksiyasi <code>(yuza, uzunlik)</code> kortejini qaytarsin, ikkalasi 2 xona aniqlikda yaxlitlangan (<code>math.pi</code> dan foydalaning).",
        starter: String.raw`import math

def aylana(r):
    pass

print(aylana(3))`,
        tests: String.raw`assert aylana(3) == (28.27, 18.85), f"aylana(3) = (28.27, 18.85), siz: {aylana(3)}"
assert aylana(1) == (3.14, 6.28)`,
        hint: 'return round(math.pi * r ** 2, 2), round(2 * math.pi * r, 2)',
      },
      {
        title: 'Parol generatori',
        desc: "<code>parol(n)</code> n uzunlikdagi parol qaytarsin: katta harf, kichik harf va raqamdan kamida bittadan bo'lsin (<code>random</code> va <code>string</code> modullari).",
        starter: String.raw`import random
import string

def parol(n=10):
    pass

print(parol(12))`,
        tests: String.raw`for n in (8, 12, 20):
    for _ in range(30):
        p = parol(n)
        assert len(p) == n, f"Uzunlik {n} bo'lsin"
        assert any(c.isupper() for c in p) and any(c.islower() for c in p) and any(c.isdigit() for c in p), f"{p!r}: katta, kichik harf va raqam bo'lsin"
assert len({parol(12) for _ in range(20)}) > 15, "Parollar tasodifiy bo'lsin"`,
        hint: "belgilar = [random.choice(string.ascii_uppercase), random.choice(string.ascii_lowercase), random.choice(string.digits)]\nbelgilar += random.choices(string.ascii_letters + string.digits, k=n - 3)\nrandom.shuffle(belgilar)\nreturn \"\".join(belgilar)",
      },
    ],
  },

  // ======================= 6-MODUL =======================
  {
    id: 22, module: 6, title: 'Klasslar va obyektlar', minutes: 25,
    intro: "Obyektga yo'naltirilgan dasturlash (OOP) — ma'lumot va unga tegishli amallarni bitta \"obyekt\"ga birlashtirish. Klass — chizma, obyekt — shu chizma bo'yicha yaratilgan narsa.",
    sections: [
      {
        h: 'Klass, __init__ va self',
        html: "<p><code>__init__</code> — obyekt yaratilganda avtomatik chaqiriladigan konstruktor. <code>self</code> — obyektning o'zi; atributlar <code>self.nom</code> ko'rinishida saqlanadi.</p>",
        code: String.raw`class Talaba:
    def __init__(self, ism, kurs):
        self.ism = ism
        self.kurs = kurs
        self.baholar = []

    def baho_qosh(self, baho):
        self.baholar.append(baho)

    def ortacha(self):
        return sum(self.baholar) / len(self.baholar) if self.baholar else 0

ali = Talaba("Ali", 2)
ali.baho_qosh(5)
ali.baho_qosh(4)
print(ali.ism, ali.kurs, ali.ortacha())`,
      },
      {
        h: 'Klass atributlari va metodlar',
        html: "<p>Klass atributi barcha obyektlar uchun umumiy. <code>@classmethod</code> klass bilan, <code>@staticmethod</code> esa klassga bog'liq bo'lmagan yordamchi funksiya sifatida ishlaydi.</p>",
        code: String.raw`class Mashina:
    soni = 0                       # barcha mashinalar uchun umumiy

    def __init__(self, model):
        self.model = model
        Mashina.soni += 1

    @staticmethod
    def km_dan_milga(km):
        return km * 0.621

m1, m2 = Mashina("Malibu"), Mashina("Nexia")
print(Mashina.soni, Mashina.km_dan_milga(100))`,
      },
      {
        h: 'Inkapsulyatsiya va @property',
        html: "<p>Pastki chiziq bilan boshlangan atribut (<code>_balans</code>) — \"ichki\" deb kelishilgan. <code>@property</code> atributni o'qishni boshqaradi, setter esa qiymatni tekshiradi.</p>",
        code: String.raw`class Hisob:
    def __init__(self, egasi):
        self.egasi = egasi
        self._balans = 0

    @property
    def balans(self):
        return self._balans

    def toldirish(self, summa):
        if summa <= 0:
            raise ValueError("Summa musbat bo'lsin")
        self._balans += summa

h = Hisob("Laylo")
h.toldirish(50000)
print(h.egasi, h.balans)`,
      },
      {
        h: '__str__ va __repr__',
        html: "<p>Obyekt <code>print()</code> qilinganda chiroyli ko'rinishi uchun <code>__str__</code> yoziladi.</p>",
        code: String.raw`class Kitob:
    def __init__(self, nom, muallif):
        self.nom, self.muallif = nom, muallif

    def __str__(self):
        return f"«{self.nom}» — {self.muallif}"

    def __repr__(self):
        return f"Kitob({self.nom!r}, {self.muallif!r})"

k = Kitob("Kecha va kunduz", "Cho'lpon")
print(k)
print([k])`,
      },
    ],
    quiz: [
      { q: '__init__ qachon chaqiriladi?', options: ["Dastur boshida", "Obyekt yaratilganda", "Obyekt o'chirilganda", "print() da"], answer: 1, explain: 'Konstruktor — Klass() chaqirilganda.' },
      { q: 'self nima?', options: ["Kalit so'z", "Klassning nomi", "Metod chaqirilgan obyektning o'zi", "Global o'zgaruvchi"], answer: 2, explain: "self — joriy obyekt." },
    ],
    tasks: [
      {
        title: "To'g'ri to'rtburchak klassi",
        desc: "<code>Turtburchak(eni, boyi)</code> klassini yozing: <code>yuza()</code>, <code>perimetr()</code> metodlari va <code>kvadratmi()</code> (eni == boyi bo'lsa True).",
        starter: String.raw`class Turtburchak:
    def __init__(self, eni, boyi):
        pass

t = Turtburchak(3, 4)
print(t.yuza(), t.perimetr(), t.kvadratmi())`,
        tests: String.raw`t = Turtburchak(3, 4)
assert t.yuza() == 12 and t.perimetr() == 14 and t.kvadratmi() is False
assert Turtburchak(5, 5).kvadratmi() is True`,
        hint: "self.eni = eni\nself.boyi = boyi\n\ndef yuza(self):\n    return self.eni * self.boyi",
      },
      {
        title: 'Savat',
        desc: "<code>Savat</code> klassi: <code>qosh(nom, narx, soni=1)</code>, <code>olib_tashla(nom)</code>, <code>jami()</code> (umumiy narx) va <code>len(savat)</code> — mahsulotlar turi soni (<code>__len__</code>).",
        starter: String.raw`class Savat:
    def __init__(self):
        self.mahsulotlar = {}

s = Savat()
s.qosh("non", 4000, 2)
s.qosh("sut", 12000)
print(s.jami(), len(s))`,
        tests: String.raw`s = Savat()
s.qosh("non", 4000, 2)
s.qosh("sut", 12000)
assert s.jami() == 20000 and len(s) == 2
s.qosh("non", 4000)
assert s.jami() == 24000 and len(s) == 2, "Bir xil mahsulot qo'shilsa, soni oshsin"
s.olib_tashla("sut")
assert s.jami() == 12000 and len(s) == 1`,
        hint: "def qosh(self, nom, narx, soni=1):\n    eski = self.mahsulotlar.get(nom, (narx, 0))[1]\n    self.mahsulotlar[nom] = (narx, eski + soni)\n\ndef jami(self):\n    return sum(n * s for n, s in self.mahsulotlar.values())",
      },
    ],
  },
  {
    id: 23, module: 6, title: 'Meros, polimorfizm va maxsus metodlar', minutes: 25,
    intro: "Meros — mavjud klass asosida yangisini yaratish. Polimorfizm — turli obyektlarning bir xil metodga o'zicha javob berishi. Maxsus (dunder) metodlar obyektlarga +, ==, < kabi amallarni o'rgatadi.",
    sections: [
      {
        h: 'Meros va super()',
        html: "<p>Bola klass ota klassning barcha atribut va metodlarini oladi, ularni kengaytirishi yoki qayta yozishi mumkin. <code>super()</code> — ota klassga murojaat.</p>",
        code: String.raw`class Hayvon:
    def __init__(self, ism):
        self.ism = ism

    def ovoz(self):
        return "..."

    def tanishtir(self):
        return f"{self.ism}: {self.ovoz()}"

class It(Hayvon):
    def ovoz(self):
        return "Vov!"

class Mushuk(Hayvon):
    def __init__(self, ism, rangi):
        super().__init__(ism)
        self.rangi = rangi

    def ovoz(self):
        return "Miyov"

for h in [It("Bobik"), Mushuk("Mosh", "kulrang"), Hayvon("Baliq")]:
    print(h.tanishtir())          # polimorfizm`,
      },
      {
        h: 'isinstance va abstrakt klass',
        html: "<p><code>isinstance(obj, Klass)</code> obyekt turini tekshiradi (merosni ham hisobga oladi). <code>abc</code> moduli bilan \"albatta yozilishi kerak\" bo'lgan metodlarni belgilash mumkin.</p>",
        code: String.raw`from abc import ABC, abstractmethod
import math

class Shakl(ABC):
    @abstractmethod
    def yuza(self): ...

class Doira(Shakl):
    def __init__(self, r): self.r = r
    def yuza(self): return math.pi * self.r ** 2

class Kvadrat(Shakl):
    def __init__(self, a): self.a = a
    def yuza(self): return self.a ** 2

shakllar = [Doira(1), Kvadrat(3)]
print([round(s.yuza(), 2) for s in shakllar])
print(isinstance(shakllar[0], Shakl))`,
      },
      {
        h: 'Maxsus metodlar',
        html: "<p><code>__add__</code> (+), <code>__eq__</code> (==), <code>__lt__</code> (&lt;), <code>__len__</code> (len), <code>__getitem__</code> ([ ]) va boshqalar.</p>",
        code: String.raw`class Vektor:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __add__(self, o):
        return Vektor(self.x + o.x, self.y + o.y)
    def __mul__(self, k):
        return Vektor(self.x * k, self.y * k)
    def __eq__(self, o):
        return (self.x, self.y) == (o.x, o.y)
    def __abs__(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5
    def __repr__(self):
        return f"Vektor({self.x}, {self.y})"

a, b = Vektor(1, 2), Vektor(3, 4)
print(a + b, b * 2, abs(b), a == Vektor(1, 2))`,
      },
      {
        h: 'dataclass — qisqa yozuv',
        html: "<p><code>@dataclass</code> <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code> ni avtomatik yaratadi.</p>",
        code: String.raw`from dataclasses import dataclass, field

@dataclass(order=True)
class Talaba:
    ball: int
    ism: str = field(compare=False)

guruh = [Talaba(82, "Ali"), Talaba(95, "Gul"), Talaba(61, "Vali")]
print(sorted(guruh, reverse=True)[0])
print(Talaba(90, "X") == Talaba(90, "Y"))`,
      },
    ],
    quiz: [
      { q: 'class B(A): — bu nima?', options: ['B — A ning merosxo\'ri', "A — B ning merosxo'ri", 'Ikki klass birlashadi', 'xato'], answer: 0, explain: 'B A dan meros oladi.' },
      { q: 'a + b ishlashi uchun qaysi metod kerak?', options: ['__plus__', '__add__', '__sum__', '__concat__'], answer: 1, explain: '__add__.' },
    ],
    tasks: [
      {
        title: 'Xodimlar',
        desc: "<code>Xodim(ism, maosh)</code> klassida <code>oylik()</code> maoshni qaytarsin. <code>Menejer(Xodim)</code> qo'shimcha <code>bonus</code> parametrini olsin va <code>oylik()</code> maosh + bonusni qaytarsin (<code>super()</code> ishlating).",
        starter: String.raw`class Xodim:
    pass

class Menejer(Xodim):
    pass

print(Menejer("Sardor", 8000000, 2000000).oylik())`,
        tests: String.raw`x = Xodim("Ali", 5000000)
m = Menejer("Sardor", 8000000, 2000000)
assert x.oylik() == 5000000 and m.oylik() == 10000000
assert isinstance(m, Xodim), "Menejer Xodim'dan meros olsin"
assert "super()" in __code__, "super() dan foydalaning"`,
        hint: "class Menejer(Xodim):\n    def __init__(self, ism, maosh, bonus):\n        super().__init__(ism, maosh)\n        self.bonus = bonus\n\n    def oylik(self):\n        return super().oylik() + self.bonus",
      },
      {
        title: 'Kasr soni',
        desc: "<code>Kasr(surat, maxraj)</code> klassi: avtomatik qisqarsin (<code>math.gcd</code>), <code>+</code> va <code>==</code> ishlasin, <code>str()</code> natijasi <code>\"1/2\"</code> ko'rinishida bo'lsin.",
        starter: String.raw`import math

class Kasr:
    def __init__(self, surat, maxraj):
        pass

print(Kasr(1, 2) + Kasr(1, 3))`,
        tests: String.raw`assert str(Kasr(2, 4)) == "1/2", "Kasr qisqarsin: 2/4 → 1/2"
assert str(Kasr(1, 2) + Kasr(1, 3)) == "5/6"
assert Kasr(1, 2) == Kasr(3, 6)
assert str(Kasr(1, 4) + Kasr(3, 4)) == "1/1"`,
        hint: "g = math.gcd(surat, maxraj)\nself.s, self.m = surat // g, maxraj // g\n\ndef __add__(self, o):\n    return Kasr(self.s * o.m + o.s * self.m, self.m * o.m)\n\ndef __eq__(self, o):\n    return (self.s, self.m) == (o.s, o.m)\n\ndef __str__(self):\n    return f\"{self.s}/{self.m}\"",
      },
    ],
  },

  // ======================= 7-MODUL =======================
  {
    id: 24, module: 7, title: 'Iteratorlar va generatorlar', minutes: 20,
    intro: "Generator — qiymatlarni bittadan, kerak bo'lganda ishlab chiqaradigan funksiya. Katta ma'lumotlar bilan xotirani tejab ishlash imkonini beradi.",
    sections: [
      {
        h: 'yield',
        html: "<p><code>return</code> o'rniga <code>yield</code> ishlatilsa, funksiya generatorga aylanadi: har safar keyingi qiymatni beradi va to'xtab turadi.</p>",
        code: String.raw`def sanoq(n):
    i = 1
    while i <= n:
        yield i
        i += 1

for x in sanoq(5):
    print(x, end=" ")
print()
g = sanoq(3)
print(next(g), next(g), next(g))`,
      },
      {
        h: 'Cheksiz generator',
        html: "<p>Generator cheksiz bo'lishi mumkin — chunki qiymatlar oldindan hisoblanmaydi.</p>",
        code: String.raw`from itertools import islice

def fibonachchi():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

print(list(islice(fibonachchi(), 15)))`,
      },
      {
        h: 'Generator ifoda va xotira',
        html: "<p>Qavsli comprehension — generator ifoda. U ro'yxat yaratmaydi, shuning uchun xotira deyarli sarflanmaydi.</p>",
        code: String.raw`import sys
royxat = [x * x for x in range(100000)]
gen = (x * x for x in range(100000))
print(sys.getsizeof(royxat), "bayt")
print(sys.getsizeof(gen), "bayt")
print(sum(x * x for x in range(100000)))`,
      },
      {
        h: 'itertools',
        html: "<p>Iteratorlar bilan ishlash uchun tayyor \"g'ishtlar\".</p>",
        code: String.raw`from itertools import permutations, combinations, product, chain, groupby
print(list(permutations("abc", 2)))
print(list(combinations([1, 2, 3, 4], 2)))
print(list(product("ab", [0, 1])))
print(list(chain([1, 2], (3,), "45")))`,
      },
    ],
    quiz: [
      { q: 'Generator funksiyani oddiy funksiyadan nima ajratadi?', options: ['lambda', 'yield', 'async', 'return'], answer: 1, explain: 'yield.' },
      { q: '(x for x in range(3)) qanday tur?', options: ['list', 'tuple', 'generator', 'set'], answer: 2, explain: 'Qavsli comprehension — generator ifoda.' },
    ],
    tasks: [
      {
        title: 'Juft sonlar generatori',
        desc: "<code>juftlar(n)</code> generatori 0 dan n gacha (n kirmaydi) juft sonlarni <code>yield</code> qilsin.",
        starter: String.raw`def juftlar(n):
    pass

print(list(juftlar(10)))`,
        tests: String.raw`import types
assert isinstance(juftlar(5), types.GeneratorType), "yield ishlating — funksiya generator bo'lsin"
assert list(juftlar(10)) == [0, 2, 4, 6, 8] and list(juftlar(1)) == [0]`,
        hint: 'for i in range(0, n, 2):\n    yield i',
      },
      {
        title: "Bo'laklarga bo'lish",
        desc: "<code>boliklar(l, n)</code> ro'yxatni n ta elementli bo'laklarga bo'lib <code>yield</code> qilsin: <code>boliklar([1,2,3,4,5], 2)</code> → [1,2], [3,4], [5].",
        starter: String.raw`def boliklar(l, n):
    pass

print(list(boliklar([1, 2, 3, 4, 5], 2)))`,
        tests: String.raw`assert list(boliklar([1, 2, 3, 4, 5], 2)) == [[1, 2], [3, 4], [5]]
assert list(boliklar([], 3)) == []
assert list(boliklar(list(range(6)), 3)) == [[0, 1, 2], [3, 4, 5]]`,
        hint: 'for i in range(0, len(l), n):\n    yield l[i:i + n]',
      },
    ],
  },
  {
    id: 25, module: 7, title: 'Dekoratorlar va kontekst menejerlari', minutes: 22,
    intro: "Dekorator — funksiyani o'zgartirmasdan unga yangi xususiyat qo'shadigan \"o'ram\". Django va Flask'da @login_required, @app.route kabi dekoratorlar hamma joyda uchraydi.",
    sections: [
      {
        h: 'Funksiya — birinchi darajali obyekt',
        html: "<p>Funksiyani o'zgaruvchiga saqlash, boshqa funksiyaga berish va funksiyadan qaytarish mumkin. Ichki funksiya tashqi o'zgaruvchilarni \"eslab qoladi\" (closure).</p>",
        code: String.raw`def kopaytiruvchi(n):
    def ichki(x):
        return x * n
    return ichki

ikki_barobar = kopaytiruvchi(2)
uch_barobar = kopaytiruvchi(3)
print(ikki_barobar(10), uch_barobar(10))`,
      },
      {
        h: 'Birinchi dekorator',
        html: "<p>Dekorator funksiyani qabul qiladi va yangi (o'ralgan) funksiya qaytaradi. <code>@dekorator</code> yozuvi <code>f = dekorator(f)</code> ning qisqasi. <code>functools.wraps</code> asl funksiya nomini saqlaydi.</p>",
        code: String.raw`import time
from functools import wraps

def vaqtni_olch(func):
    @wraps(func)
    def oram(*args, **kwargs):
        t = time.perf_counter()
        natija = func(*args, **kwargs)
        print(f"{func.__name__}: {(time.perf_counter() - t) * 1000:.2f} ms")
        return natija
    return oram

@vaqtni_olch
def yigindi(n):
    return sum(range(n))

print(yigindi(1_000_000))`,
      },
      {
        h: 'Parametrli dekorator',
        html: "<p>Dekoratorga parametr berish uchun yana bitta qatlam kerak.</p>",
        code: String.raw`def takrorla(marta):
    def dekorator(func):
        def oram(*args):
            for _ in range(marta):
                func(*args)
        return oram
    return dekorator

@takrorla(3)
def salom(ism):
    print("Salom,", ism)

salom("Python")`,
      },
      {
        h: 'Kontekst menejeri (with)',
        html: "<p><code>with</code> bilan ishlaydigan obyekt <code>__enter__</code> va <code>__exit__</code> metodlariga ega. <code>contextlib.contextmanager</code> bilan uni generator orqali yozish oson.</p>",
        code: String.raw`from contextlib import contextmanager

@contextmanager
def bolim(nom):
    print(f"--- {nom} boshlandi ---")
    try:
        yield
    finally:
        print(f"--- {nom} tugadi ---")

with bolim("Hisobot"):
    print("Ma'lumotlar tayyorlanmoqda...")`,
      },
    ],
    quiz: [
      { q: '@d yozuvi nimaga teng?', options: ['f = d', 'f = d(f)', 'd = f(d)', 'f()'], answer: 1, explain: "Dekorator funksiyani o'rab, qaytadan nomlaydi." },
      { q: 'functools.wraps nima uchun?', options: ['Tezlashtirish', "Asl funksiya nomi va docstring'ini saqlash", 'Xatolarni ushlash', 'Kesh'], answer: 1, explain: "Aks holda __name__ 'oram' bo'lib qoladi." },
    ],
    tasks: [
      {
        title: 'Chaqiruvlar hisoblagichi',
        desc: "<code>hisobla</code> dekoratori funksiya necha marta chaqirilganini <code>func.chaqiruvlar</code> atributida saqlasin.",
        starter: String.raw`def hisobla(func):
    pass

@hisobla
def salom():
    return "salom"

salom(); salom(); salom()
print(salom.chaqiruvlar)`,
        tests: String.raw`@hisobla
def f(x):
    return x * 2
assert f.chaqiruvlar == 0
assert f(5) == 10 and f(1) == 2
assert f.chaqiruvlar == 2, "Har chaqiruvda 1 ga oshsin"`,
        hint: "def oram(*args, **kwargs):\n    oram.chaqiruvlar += 1\n    return func(*args, **kwargs)\noram.chaqiruvlar = 0\nreturn oram",
      },
      {
        title: 'Turni tekshiruvchi dekorator',
        desc: "<code>faqat_sonlar</code> dekoratori funksiyaga berilgan har bir argument <code>int</code> yoki <code>float</code> bo'lmasa <code>TypeError</code> chiqarsin.",
        starter: String.raw`def faqat_sonlar(func):
    pass

@faqat_sonlar
def qosh(a, b):
    return a + b

print(qosh(2, 3.5))`,
        tests: String.raw`@faqat_sonlar
def k(a, b):
    return a * b
assert k(2, 3) == 6 and k(1.5, 2) == 3.0
try:
    k("2", 3)
except TypeError:
    pass
else:
    raise AssertionError("k('2', 3) TypeError chiqarishi kerak")`,
        hint: "def oram(*args):\n    for a in args:\n        if not isinstance(a, (int, float)):\n            raise TypeError(\"Faqat sonlar\")\n    return func(*args)\nreturn oram",
      },
    ],
  },
  {
    id: 26, module: 7, title: 'Yakuniy loyiha: Kutubxona tizimi', minutes: 40,
    intro: "Barcha bilimlarni birlashtiramiz: klasslar, lug'atlar, xatolar, JSON va funksiyalar. Kichik, lekin haqiqiy kutubxona boshqaruv tizimini yozasiz. Tayyor bo'lgach, uni PyCharm Online'da kengaytiring!",
    sections: [
      {
        h: 'Loyiha tuzilishi',
        html: "<p>Tizim uch qismdan iborat:</p><ol><li><code>Kitob</code> — nom, muallif, yil, <code>mavjud</code> holati</li><li><code>Kutubxona</code> — kitoblar ro'yxati, qidirish, berish va qaytarish</li><li>Saqlash — JSON faylga yozish va o'qish</li></ol><p>Quyida namunaviy boshlang'ich kod. Uni ishga tushirib ko'ring.</p>",
        code: String.raw`from dataclasses import dataclass, asdict

@dataclass
class Kitob:
    nom: str
    muallif: str
    yil: int
    mavjud: bool = True

k = Kitob("Sariq devni minib", "X. To'xtaboyev", 1968)
print(k)
print(asdict(k))`,
      },
      {
        h: 'Kutubxona klassi',
        html: "<p>Kitoblar lug'atda saqlanadi — kalit sifatida kichik harfli nom. Noto'g'ri amallar uchun xato chiqariladi.</p>",
        code: String.raw`class Kutubxona:
    def __init__(self):
        self.kitoblar = {}

    def qosh(self, kitob):
        self.kitoblar[kitob.nom.lower()] = kitob

    def qidir(self, soz):
        soz = soz.lower()
        return [k for k in self.kitoblar.values() if soz in k.nom.lower() or soz in k.muallif.lower()]

from dataclasses import dataclass
@dataclass
class Kitob:
    nom: str
    muallif: str
    yil: int
    mavjud: bool = True

kt = Kutubxona()
kt.qosh(Kitob("O'tkan kunlar", "A. Qodiriy", 1925))
kt.qosh(Kitob("Mehrobdan chayon", "A. Qodiriy", 1929))
print([k.nom for k in kt.qidir("qodiriy")])`,
      },
      {
        h: 'Keyingi qadamlar',
        html: "<p>Loyihani topshiriqdagi talablar bo'yicha yakunlang. Keyin uni <b>PyCharm Online</b>ga o'tkazib, quyidagilarni qo'shib ko'ring:</p><ul><li>Kitobni kim olganini va qachon qaytarishi kerakligini saqlash (<code>datetime</code>)</li><li>Menyu: <code>input()</code> bilan buyruqlar (qo'shish, qidirish, berish)</li><li>Testlar (<code>test_kutubxona.py</code> — <code>unittest</code>)</li><li>Statistika: eng ko'p o'qilgan muallif</li></ul><p>🎓 Tabriklaymiz — siz Python asoslarini to'liq o'zlashtirdingiz! Keyingi bosqich: Django yoki Flask bilan veb-dasturlash, pandas bilan ma'lumotlar tahlili.</p>",
      },
    ],
    quiz: [
      { q: "Lug'atda kitobni nom bo'yicha topish murakkabligi?", options: ["Ro'yxat uzunligiga bog'liq", 'Deyarli bir zumda (O(1))', 'Har doim sekin', 'Imkonsiz'], answer: 1, explain: "Lug'at xesh-jadval asosida ishlaydi." },
    ],
    tasks: [
      {
        title: 'Kutubxona tizimi',
        desc: "<ul><li><code>Kitob(nom, muallif, yil)</code> — <code>mavjud</code> atributi standart <code>True</code></li><li><code>Kutubxona</code>: <code>qosh(kitob)</code>, <code>qidir(soz)</code> (nom yoki muallif bo'yicha, katta-kichik harf farqsiz, kitoblar ro'yxatini qaytaradi)</li><li><code>berish(nom)</code> — kitob yo'q bo'lsa <code>KeyError</code>, band bo'lsa <code>ValueError</code>, aks holda <code>mavjud = False</code></li><li><code>qaytarish(nom)</code> — <code>mavjud = True</code></li><li><code>saqlash(fayl)</code> va <code>Kutubxona.yuklash(fayl)</code> (classmethod) — JSON orqali</li></ul>",
        starter: String.raw`import json

class Kitob:
    def __init__(self, nom, muallif, yil):
        pass

class Kutubxona:
    def __init__(self):
        self.kitoblar = {}

    def qosh(self, kitob):
        pass

    def qidir(self, soz):
        pass

    def berish(self, nom):
        pass

    def qaytarish(self, nom):
        pass

    def saqlash(self, fayl):
        pass

    @classmethod
    def yuklash(cls, fayl):
        pass


kt = Kutubxona()
kt.qosh(Kitob("O'tkan kunlar", "A. Qodiriy", 1925))
kt.qosh(Kitob("Kecha va kunduz", "Cho'lpon", 1936))
print([k.nom for k in kt.qidir("qodiriy")])`,
        tests: String.raw`kt = Kutubxona()
kt.qosh(Kitob("O'tkan kunlar", "A. Qodiriy", 1925))
kt.qosh(Kitob("Mehrobdan chayon", "A. Qodiriy", 1929))
kt.qosh(Kitob("Kecha va kunduz", "Cho'lpon", 1936))
assert len(kt.qidir("QODIRIY")) == 2, "Muallif bo'yicha qidiruv (katta-kichik harf farqsiz)"
assert len(kt.qidir("kecha")) == 1, "Nom bo'yicha qidiruv"
assert Kitob("a", "b", 1).mavjud is True
kt.berish("O'tkan kunlar")
assert kt.qidir("o'tkan")[0].mavjud is False, "Berilgan kitob mavjud=False bo'lsin"
try:
    kt.berish("O'tkan kunlar")
except ValueError:
    pass
else:
    raise AssertionError("Band kitobni berishda ValueError chiqsin")
try:
    kt.berish("Yo'q kitob")
except KeyError:
    pass
else:
    raise AssertionError("Mavjud bo'lmagan kitob uchun KeyError chiqsin")
kt.qaytarish("O'tkan kunlar")
assert kt.qidir("o'tkan")[0].mavjud is True
kt.berish("Kecha va kunduz")
kt.saqlash("_kutubxona.json")
kt2 = Kutubxona.yuklash("_kutubxona.json")
assert isinstance(kt2, Kutubxona) and len(kt2.qidir("")) == 3, "Yuklangan kutubxonada 3 ta kitob bo'lsin"
assert kt2.qidir("kecha")[0].mavjud is False, "mavjud holati ham saqlansin"`,
        hint: "Kitobni lug'atga aylantirish: k.__dict__\nsaqlash: json.dump([k.__dict__ for k in self.kitoblar.values()], f)\nyuklash: kt = cls(); for d in json.load(f): k = Kitob(d['nom'], d['muallif'], d['yil']); k.mavjud = d['mavjud']; kt.qosh(k)",
      },
    ],
  },
);
