/* Python kursi — 1-qism: asoslar, boshqaruv, ma'lumotlar tuzilmalari (1–14-darslar)
   Har bir dars: sections (nazariya + ishga tushiriladigan kod), quiz (test), tasks (avtomatik tekshiriladigan topshiriq).
   Topshiriq testlarida `out` — foydalanuvchi kodining chiqishi, qolgan nomlar — uning o'zgaruvchi va funksiyalari. */
window.COURSE = window.COURSE || [];
window.COURSE_MODULES = [
  { id: 1, title: 'Python asoslari', icon: '🐣' },
  { id: 2, title: 'Shartlar va sikllar', icon: '🔁' },
  { id: 3, title: "Ma'lumotlar tuzilmalari", icon: '📦' },
  { id: 4, title: 'Funksiyalar', icon: '🧩' },
  { id: 5, title: 'Xatolar, fayllar, modullar', icon: '🛠' },
  { id: 6, title: "Obyektga yo'naltirilgan dasturlash", icon: '🏛' },
  { id: 7, title: 'Professional Python', icon: '🚀' },
];

window.COURSE.push(
  // ======================= 1-MODUL =======================
  {
    id: 1, module: 1, title: 'Python bilan tanishuv', minutes: 10,
    intro: "Python — o'rganish oson, lekin juda kuchli dasturlash tili. Unda veb-saytlar (Django, Flask), sun'iy intellekt, ma'lumotlar tahlili, o'yinlar va avtomatlashtirish dasturlari yoziladi. Bu darsda birinchi dasturingizni yozasiz.",
    sections: [
      {
        h: 'Birinchi dastur: print()',
        html: "<p><code>print()</code> funksiyasi qavs ichidagi ma'lumotni ekranga chiqaradi. Matn qo'shtirnoq <code>\"...\"</code> yoki bittalik tirnoq <code>'...'</code> ichida yoziladi.</p><p>Quyidagi kodni <b>▶ Ishga tushirish</b> tugmasi bilan bajaring, keyin matnni o'zgartirib ko'ring.</p>",
        code: String.raw`print("Salom, Dunyo!")
print('Men Python o\'rganyapman')`,
      },
      {
        h: 'Bir nechta qiymat va sonlar',
        html: "<p><code>print()</code> ga vergul bilan bir nechta qiymat berish mumkin — ular orasiga bo'sh joy qo'yiladi. Sonlar tirnoqsiz yoziladi va Python ularni hisoblay oladi.</p>",
        code: String.raw`print("Yosh:", 15)
print(2 + 3)
print("2 + 3 =", 2 + 3)`,
      },
      {
        h: 'Izohlar (comments)',
        html: "<p><code>#</code> belgisidan keyingi matn <b>izoh</b> — Python uni bajarmaydi. Izohlar kodni tushuntirish uchun yoziladi.</p>",
        code: String.raw`# Bu izoh — dastur uni o'qimaydi
print("Izohdan keyingi qator ishlaydi")  # qator oxirida ham bo'ladi`,
      },
      {
        h: 'sep va end parametrlari',
        html: "<p><code>sep</code> — qiymatlar orasidagi ajratuvchi, <code>end</code> — qator oxiriga qo'yiladigan belgi (odatda yangi qator <code>\\n</code>).</p>",
        code: String.raw`print("2026", "10", "22", sep="-")
print("Bir", end=" ")
print("qatorda")`,
      },
    ],
    quiz: [
      { q: "Ekranga matn chiqarish uchun qaysi funksiya ishlatiladi?", options: ['echo()', 'print()', 'write()', 'console.log()'], answer: 1, explain: "Pythonda print() ishlatiladi." },
      { q: "Izoh qaysi belgi bilan boshlanadi?", options: ['//', '/*', '#', '--'], answer: 2, explain: "Pythonda izoh # bilan boshlanadi." },
      { q: 'print("a", "b", sep="") natijasi?', options: ['a b', 'ab', 'a,b', 'a-b'], answer: 1, explain: "sep=\"\" bo'lgani uchun orasiga hech narsa qo'yilmaydi." },
    ],
    tasks: [
      {
        title: 'Salomlashish',
        desc: "Ekranga aynan <code>Salom, Python!</code> matnini chiqaring.",
        starter: String.raw`# Kodni shu yerga yozing
`,
        tests: String.raw`assert out.strip() == "Salom, Python!", f"Natija 'Salom, Python!' bo'lishi kerak, siz chiqardingiz: {out.strip()!r}"`,
        hint: 'print("Salom, Python!")',
      },
      {
        title: 'Uch qator',
        desc: "Uchta alohida qatorga <code>1</code>, <code>2</code>, <code>3</code> sonlarini chiqaring.",
        starter: '',
        tests: String.raw`assert out.split() == ["1", "2", "3"], "Har bir son alohida qatorda bo'lsin: 1, 2, 3"
assert out.strip().count("\n") == 2, "Aynan 3 ta qator bo'lishi kerak"`,
        hint: "Uchta print() yozing yoki print(1, 2, 3, sep=\"\\n\")",
      },
    ],
  },
  {
    id: 2, module: 1, title: "O'zgaruvchilar va ma'lumot turlari", minutes: 15,
    intro: "O'zgaruvchi — qiymatni saqlaydigan nomlangan \"quti\". Bu darsda o'zgaruvchi yaratish, nomlash qoidalari va asosiy ma'lumot turlarini o'rganasiz.",
    sections: [
      {
        h: "O'zgaruvchi yaratish",
        html: "<p>O'zgaruvchi <code>=</code> belgisi bilan yaratiladi: chapda nom, o'ngda qiymat. Qiymatni istalgan payt o'zgartirish mumkin.</p>",
        code: String.raw`ism = "Ali"
yosh = 16
print(ism, yosh)

yosh = 17          # qiymat o'zgardi
print("Keyingi yil:", yosh)`,
      },
      {
        h: 'Nomlash qoidalari',
        html: "<ul><li>Nom harf yoki <code>_</code> bilan boshlanadi, raqam bilan emas: <code>2ism</code> ❌</li><li>Faqat harf, raqam va <code>_</code>: <code>talaba_soni</code> ✅</li><li>Katta-kichik harf farq qiladi: <code>Ism</code> va <code>ism</code> — ikki xil o'zgaruvchi</li><li>Kalit so'zlarni (<code>if</code>, <code>for</code>, <code>class</code>...) nom qilib bo'lmaydi</li><li>Python uslubi: so'zlar pastki chiziq bilan — <code>snake_case</code></li></ul>",
      },
      {
        h: "Asosiy ma'lumot turlari",
        html: "<table><tr><th>Tur</th><th>Nomi</th><th>Misol</th></tr><tr><td><code>int</code></td><td>butun son</td><td><code>42</code>, <code>-7</code></td></tr><tr><td><code>float</code></td><td>o'nli son</td><td><code>3.14</code></td></tr><tr><td><code>str</code></td><td>satr (matn)</td><td><code>\"salom\"</code></td></tr><tr><td><code>bool</code></td><td>mantiqiy</td><td><code>True</code>, <code>False</code></td></tr><tr><td><code>NoneType</code></td><td>\"hech narsa\"</td><td><code>None</code></td></tr></table><p><code>type()</code> funksiyasi qiymat turini ko'rsatadi.</p>",
        code: String.raw`print(type(42))
print(type(3.14))
print(type("matn"))
print(type(True))
print(type(None))`,
      },
      {
        h: 'Bir vaqtda bir nechta qiymat',
        html: "<p>Python bir qatorda bir nechta o'zgaruvchiga qiymat berishga va ularning qiymatini almashtirishga imkon beradi.</p>",
        code: String.raw`a, b, c = 1, 2, 3
print(a, b, c)

a, b = b, a        # qiymatlarni almashtirish
print("a =", a, "b =", b)`,
      },
    ],
    quiz: [
      { q: "Qaysi nom to'g'ri o'zgaruvchi nomi?", options: ['2-son', 'talaba soni', 'talaba_soni', 'class'], answer: 2, explain: "Bo'sh joy, chiziqcha va raqam bilan boshlanish mumkin emas; class — kalit so'z." },
      { q: 'type(3.0) natijasi?', options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'bool'>"], answer: 1, explain: "Nuqtali son — float." },
      { q: "x = 5; x = x + 2 dan keyin x nechaga teng?", options: ['5', '2', '7', 'xato'], answer: 2, explain: "Avval o'ng tomon hisoblanadi: 5 + 2 = 7." },
    ],
    tasks: [
      {
        title: "O'zim haqimda",
        desc: "<code>ism</code> (satr), <code>yosh</code> (butun son) va <code>talaba</code> (<code>True</code>) o'zgaruvchilarini yarating.",
        starter: String.raw`ism =
yosh =
talaba =
`,
        tests: String.raw`assert isinstance(ism, str) and ism.strip(), "ism — bo'sh bo'lmagan satr bo'lsin"
assert isinstance(yosh, int) and not isinstance(yosh, bool), "yosh — butun son (int) bo'lsin"
assert talaba is True, "talaba = True bo'lsin"`,
        hint: 'ism = "Ali"\nyosh = 16\ntalaba = True',
      },
      {
        title: 'Almashtirish',
        desc: "<code>a = 10</code> va <code>b = 20</code> berilgan. Ularning qiymatlarini almashtiring (natijada <code>a == 20</code>, <code>b == 10</code>).",
        starter: String.raw`a = 10
b = 20
# almashtiring

print(a, b)`,
        tests: String.raw`assert a == 20 and b == 10, f"a=20, b=10 bo'lishi kerak, hozir a={a}, b={b}"`,
        hint: 'a, b = b, a',
      },
    ],
  },
  {
    id: 3, module: 1, title: 'Sonlar va arifmetik amallar', minutes: 15,
    intro: "Python kuchli kalkulyator ham. Bu darsda arifmetik amallar, butun bo'lish, qoldiq, daraja va amallar tartibini o'rganasiz.",
    sections: [
      {
        h: 'Arifmetik operatorlar',
        html: "<table><tr><th>Operator</th><th>Ma'nosi</th><th>Misol</th><th>Natija</th></tr><tr><td><code>+</code></td><td>qo'shish</td><td><code>7 + 2</code></td><td>9</td></tr><tr><td><code>-</code></td><td>ayirish</td><td><code>7 - 2</code></td><td>5</td></tr><tr><td><code>*</code></td><td>ko'paytirish</td><td><code>7 * 2</code></td><td>14</td></tr><tr><td><code>/</code></td><td>bo'lish</td><td><code>7 / 2</code></td><td>3.5</td></tr><tr><td><code>//</code></td><td>butun bo'lish</td><td><code>7 // 2</code></td><td>3</td></tr><tr><td><code>%</code></td><td>qoldiq</td><td><code>7 % 2</code></td><td>1</td></tr><tr><td><code>**</code></td><td>daraja</td><td><code>7 ** 2</code></td><td>49</td></tr></table>",
        code: String.raw`print(7 + 2, 7 - 2, 7 * 2)
print(7 / 2)    # doim float
print(7 // 2)   # butun qism
print(7 % 2)    # qoldiq
print(2 ** 10)  # daraja`,
      },
      {
        h: 'Amallar tartibi',
        html: "<p>Matematikadagidek: avval qavslar, keyin <code>**</code>, so'ng <code>* / // %</code>, oxirida <code>+ -</code>.</p>",
        code: String.raw`print(2 + 3 * 4)     # 14
print((2 + 3) * 4)   # 20
print(2 ** 3 ** 2)   # 2 ** 9 = 512 (o'ngdan chapga)`,
      },
      {
        h: 'Qisqartirilgan yozuv va foydali funksiyalar',
        html: "<p><code>x += 1</code> — bu <code>x = x + 1</code> ning qisqasi. Shuningdek <code>-=</code>, <code>*=</code>, <code>/=</code> bor. <code>abs()</code> — modul, <code>round()</code> — yaxlitlash, <code>max()</code>/<code>min()</code> — eng katta/kichik.</p>",
        code: String.raw`ball = 10
ball += 5
ball *= 2
print(ball)

print(abs(-8))
print(round(3.14159, 2))
print(max(4, 9, 2), min(4, 9, 2))`,
      },
      {
        h: '% va // amaliyotda',
        html: "<p>Qoldiq son juft yoki toqligini aniqlashda, <code>//</code> va <code>%</code> esa sonni xonalarga ajratishda juda qo'l keladi.</p>",
        code: String.raw`son = 347
print("Yuzlik:", son // 100)
print("O'nlik:", son // 10 % 10)
print("Birlik:", son % 10)
print("Juftmi?", son % 2 == 0)`,
      },
    ],
    quiz: [
      { q: '17 // 5 natijasi?', options: ['3.4', '3', '2', '4'], answer: 1, explain: "// butun qismni qaytaradi: 17 = 5·3 + 2." },
      { q: '17 % 5 natijasi?', options: ['2', '3', '3.4', '0'], answer: 0, explain: '% qoldiqni beradi.' },
      { q: '10 / 2 natijasi?', options: ['5', '5.0', '"5"', 'xato'], answer: 1, explain: '/ har doim float qaytaradi.' },
    ],
    tasks: [
      {
        title: "To'g'ri to'rtburchak",
        desc: "<code>a = 7</code>, <code>b = 4</code>. <code>yuza</code> va <code>perimetr</code> o'zgaruvchilarini hisoblang.",
        starter: String.raw`a = 7
b = 4
yuza =
perimetr =
print(yuza, perimetr)`,
        tests: String.raw`assert yuza == 28, "Yuza = a * b"
assert perimetr == 22, "Perimetr = 2 * (a + b)"`,
        hint: 'yuza = a * b\nperimetr = 2 * (a + b)',
      },
      {
        title: 'Raqamlar yig\'indisi',
        desc: "Uch xonali <code>son = 583</code> raqamlari yig'indisini <code>yigindi</code> o'zgaruvchisiga hisoblang (5+8+3=16). Kod boshqa uch xonali son uchun ham ishlashi kerak.",
        starter: String.raw`son = 583
yigindi =
print(yigindi)`,
        tests: String.raw`assert yigindi == 16, "583 uchun 16 bo'lishi kerak"
src = __code__.replace("583", "907")
g = {}
exec(src.replace("print(yigindi)", ""), g)
assert g["yigindi"] == 16, "Kod boshqa son (907) uchun ham ishlashi kerak — // va % dan foydalaning"`,
        hint: 'yigindi = son // 100 + son // 10 % 10 + son % 10',
      },
    ],
  },
  {
    id: 4, module: 1, title: 'Satrlar (str)', minutes: 20,
    intro: "Satr — matn bilan ishlash uchun ma'lumot turi. Indekslar, kesish (slicing), f-satrlar va eng foydali metodlarni o'rganamiz.",
    sections: [
      {
        h: 'Indeks va uzunlik',
        html: "<p>Satrdagi har bir belgining tartib raqami — <b>indeksi</b> bor va u <b>0 dan</b> boshlanadi. Manfiy indeks oxiridan sanaydi. <code>len()</code> — uzunlik.</p>",
        code: String.raw`soz = "Python"
print(soz[0], soz[1])   # P y
print(soz[-1])          # n — oxirgi belgi
print(len(soz))         # 6`,
      },
      {
        h: 'Kesish (slicing)',
        html: "<p><code>s[boshi:oxiri:qadam]</code> — <code>boshi</code> kiradi, <code>oxiri</code> kirmaydi.</p>",
        code: String.raw`s = "dasturlash"
print(s[0:6])    # dastur
print(s[6:])     # lash
print(s[:3])     # das
print(s[::2])    # har ikkinchi belgi
print(s[::-1])   # teskari`,
      },
      {
        h: "f-satrlar: qiymatlarni matnga qo'yish",
        html: "<p>Satr oldiga <code>f</code> qo'yilsa, figurali qavs <code>{}</code> ichidagi ifoda hisoblanib, matnga qo'yiladi. Bu eng qulay usul.</p>",
        code: String.raw`ism = "Madina"
ball = 92.456
print(f"{ism} {ball:.1f} ball oldi")
print(f"Ikki baravari: {ball * 2:.2f}")`,
      },
      {
        h: 'Foydali metodlar',
        html: "<p>Satrlar o'zgarmas: metodlar asl satrni emas, <b>yangi satr</b> qaytaradi.</p>",
        code: String.raw`s = "  Salom Dunyo  "
print(s.strip())             # chetdagi bo'sh joylarni olib tashlash
print(s.upper(), s.lower())
print("salom dunyo".title())
print("olma,nok,uzum".split(","))
print("-".join(["2026", "10", "22"]))
print("banan".replace("a", "o"))
print("banan".count("a"), "banan".find("n"))
print("python".startswith("py"), "a" in "salom")`,
      },
    ],
    quiz: [
      { q: 's = "kitob"; s[1] nima?', options: ['k', 'i', 't', 'b'], answer: 1, explain: 'Indeks 0 dan boshlanadi: k=0, i=1.' },
      { q: '"abcdef"[1:4] natijasi?', options: ['abcd', 'bcd', 'bcde', 'cde'], answer: 1, explain: "1-indeks kiradi, 4-indeks kirmaydi." },
      { q: '"Hi" * 3 natijasi?', options: ['HiHiHi', 'Hi3', 'xato', 'Hi Hi Hi'], answer: 0, explain: 'Satrni songa ko\'paytirish uni takrorlaydi.' },
    ],
    tasks: [
      {
        title: 'Palindrommi?',
        desc: "<code>soz</code> o'zgaruvchisidagi so'z palindrom bo'lsa (teskarisi ham o'zi), <code>palindrom = True</code>, aks holda <code>False</code> bo'lsin. Katta-kichik harf farqi hisobga olinmasin.",
        starter: String.raw`soz = "Kiyik"
palindrom =
print(palindrom)`,
        tests: String.raw`assert palindrom is True, "Kiyik — palindrom"
for w, exp in [("Python", False), ("Anna", True), ("radar", True)]:
    g = {}
    exec(__code__.replace('"Kiyik"', repr(w)), g)
    assert g["palindrom"] is exp, f"{w!r} uchun {exp} bo'lishi kerak"`,
        hint: 'palindrom = soz.lower() == soz.lower()[::-1]',
      },
      {
        title: 'Formatlangan chiqish',
        desc: "<code>ism = \"Ali\"</code> va <code>ball = 87.5</code> dan foydalanib aynan <code>Ali: 87.5 ball</code> matnini chiqaring (f-satr bilan).",
        starter: String.raw`ism = "Ali"
ball = 87.5
`,
        tests: String.raw`assert out.strip() == "Ali: 87.5 ball", f"Kutilgan: 'Ali: 87.5 ball', siz: {out.strip()!r}"
assert "f\"" in __code__ or "f'" in __code__, "f-satrdan foydalaning"`,
        hint: 'print(f"{ism}: {ball} ball")',
      },
    ],
  },
  {
    id: 5, module: 1, title: "Ma'lumot kiritish va turlarni o'zgartirish", minutes: 15,
    intro: "Dasturlar foydalanuvchi bilan muloqot qiladi. input() bilan ma'lumot olish va int(), float(), str() bilan turlarni o'zgartirishni o'rganamiz.",
    sections: [
      {
        h: 'input()',
        html: "<p><code>input()</code> foydalanuvchi yozgan matnni qaytaradi. Qavs ichidagi matn — savol. Ishga tushirganda brauzer oynasi qiymat so'raydi.</p>",
        code: String.raw`ism = input("Ismingiz nima? ")
print(f"Xush kelibsiz, {ism}!")`,
      },
      {
        h: "input() har doim satr qaytaradi",
        html: "<p>Foydalanuvchi son yozsa ham, natija <code>str</code> bo'ladi. Hisoblash uchun uni <code>int()</code> yoki <code>float()</code> bilan songa aylantirish kerak.</p>",
        code: String.raw`a = input("Birinchi son: ")
b = input("Ikkinchi son: ")
print("Satr sifatida:", a + b)
print("Son sifatida:", int(a) + int(b))`,
      },
      {
        h: 'Turlarni o\'zgartirish',
        html: "<ul><li><code>int(\"42\")</code> → 42, <code>int(3.9)</code> → 3 (kasr qismi tashlanadi)</li><li><code>float(\"2.5\")</code> → 2.5</li><li><code>str(100)</code> → \"100\"</li><li><code>bool(0)</code> → False, <code>bool(\"a\")</code> → True</li></ul><p>Noto'g'ri qiymat (<code>int(\"salom\")</code>) xato beradi — buni 19-darsda hal qilishni o'rganamiz.</p>",
        code: String.raw`print(int("42") + 1)
print(int(3.9))
print(float("2.5") * 2)
print(str(100) + "%")
print(bool(0), bool(""), bool("a"), bool(5))`,
      },
    ],
    quiz: [
      { q: 'x = input() — foydalanuvchi 5 yozdi. type(x)?', options: ['int', 'float', 'str', 'bool'], answer: 2, explain: 'input() har doim satr qaytaradi.' },
      { q: 'int("7") + int("3") natijasi?', options: ['73', '10', '"10"', 'xato'], answer: 1, explain: 'Avval songa aylantirildi, keyin qo\'shildi.' },
      { q: '"7" + "3" natijasi?', options: ['10', '73', 'xato', '"7 3"'], answer: 1, explain: 'Satrlar qo\'shilganda yopishtiriladi.' },
    ],
    tasks: [
      {
        title: 'Yosh kalkulyatori',
        desc: "Foydalanuvchidan tug'ilgan yilini so'rang va <code>2026</code>-yildagi yoshini <code>Siz 20 yoshdasiz</code> ko'rinishida chiqaring. (Tekshiruvda 2006 kiritiladi.)",
        starter: String.raw`yil = input("Tug'ilgan yilingiz: ")
`,
        inputs: ['2006'],
        tests: String.raw`assert "Siz 20 yoshdasiz" in out, f"2006 uchun 'Siz 20 yoshdasiz' chiqishi kerak. Chiqish: {out!r}"`,
        hint: 'yosh = 2026 - int(yil)\nprint(f"Siz {yosh} yoshdasiz")',
      },
      {
        title: "O'rtacha ball",
        desc: "Uchta bahoni (<code>input()</code> bilan) so'rang va o'rtachasini 2 xona aniqlikda chiqaring: <code>O'rtacha: 4.33</code>. (Tekshiruvda 5, 4, 4 kiritiladi.)",
        starter: '',
        inputs: ['5', '4', '4'],
        tests: String.raw`assert "O'rtacha: 4.33" in out, f"5, 4, 4 uchun \"O'rtacha: 4.33\" chiqishi kerak. Chiqish: {out!r}"`,
        hint: "a = int(input())\nb = int(input())\nc = int(input())\nprint(f\"O'rtacha: {(a + b + c) / 3:.2f}\")",
      },
    ],
  },

  // ======================= 2-MODUL =======================
  {
    id: 6, module: 2, title: 'Taqqoslash va mantiqiy ifodalar', minutes: 12,
    intro: "Dastur qaror qabul qilishi uchun shartlarni tekshira bilishi kerak. Taqqoslash operatorlari va and/or/not bilan tanishamiz.",
    sections: [
      {
        h: 'Taqqoslash operatorlari',
        html: "<p>Natija har doim <code>True</code> yoki <code>False</code>: <code>==</code> teng, <code>!=</code> teng emas, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>.</p><p>⚠ <code>=</code> — qiymat berish, <code>==</code> — taqqoslash!</p>",
        code: String.raw`x = 7
print(x == 7, x != 7)
print(x > 5, x <= 6)
print("olma" == "Olma")       # katta-kichik harf muhim
print(1 < x < 10)             # Pythonda zanjir bo'lib yoziladi`,
      },
      {
        h: 'and, or, not',
        html: "<ul><li><code>and</code> — ikkalasi ham rost bo'lsa True</li><li><code>or</code> — kamida bittasi rost bo'lsa True</li><li><code>not</code> — teskarisi</li></ul>",
        code: String.raw`yosh = 17
guvohnoma = True
print(yosh >= 18 and guvohnoma)
print(yosh >= 18 or guvohnoma)
print(not guvohnoma)`,
      },
      {
        h: '"Rost" va "yolg\'on" qiymatlar',
        html: "<p><code>0</code>, <code>0.0</code>, <code>\"\"</code>, <code>[]</code>, <code>{}</code>, <code>None</code> — yolg'on (False) hisoblanadi, qolgan hammasi — rost.</p>",
        code: String.raw`for qiymat in [0, 5, "", "a", [], [1], None]:
    print(repr(qiymat), "->", bool(qiymat))`,
      },
    ],
    quiz: [
      { q: '5 == 5.0 natijasi?', options: ['True', 'False', 'xato'], answer: 0, explain: 'Qiymatlari teng.' },
      { q: 'True and False or True ?', options: ['True', 'False'], answer: 0, explain: '(True and False) or True = False or True = True.' },
      { q: 'bool([]) natijasi?', options: ['True', 'False'], answer: 1, explain: "Bo'sh ro'yxat — yolg'on." },
    ],
    tasks: [
      {
        title: 'Kabisa yili',
        desc: "<code>yil</code> kabisa bo'lsa <code>kabisa = True</code>. Qoida: 4 ga bo'linadi va 100 ga bo'linmaydi, YOKI 400 ga bo'linadi.",
        starter: String.raw`yil = 2024
kabisa =
print(kabisa)`,
        tests: String.raw`for y, e in [(2024, True), (1900, False), (2000, True), (2023, False)]:
    g = {}
    exec(__code__.replace("2024", str(y), 1), g)
    assert g["kabisa"] is e, f"{y}-yil uchun {e} bo'lishi kerak"`,
        hint: 'kabisa = (yil % 4 == 0 and yil % 100 != 0) or yil % 400 == 0',
      },
    ],
  },
  {
    id: 7, module: 2, title: 'Shartli operatorlar: if, elif, else', minutes: 18,
    intro: "if yordamida dastur shartga qarab turli yo'llarni tanlaydi. Chekinish (indentatsiya) Pythonda juda muhim — u kod blokini belgilaydi.",
    sections: [
      {
        h: 'if va else',
        html: "<p>Shartdan keyin <code>:</code> qo'yiladi, blok esa <b>4 ta bo'sh joy</b> bilan suriladi.</p>",
        code: String.raw`harorat = 28
if harorat > 25:
    print("Issiq kun ☀")
    print("Suv ichishni unutmang")
else:
    print("Salqin kun 🌥")
print("Bu qator har doim bajariladi")`,
      },
      {
        h: 'elif — bir nechta shart',
        html: "<p>Shartlar yuqoridan pastga tekshiriladi, birinchi rost bo'lgani bajariladi.</p>",
        code: String.raw`ball = 78
if ball >= 90:
    baho = 5
elif ball >= 70:
    baho = 4
elif ball >= 50:
    baho = 3
else:
    baho = 2
print("Baho:", baho)`,
      },
      {
        h: 'Ichma-ich shartlar va qisqa yozuv',
        html: "<p>Shart ichida yana shart bo'lishi mumkin. Oddiy holatlar uchun bir qatorli <b>ternar</b> ifoda bor: <code>A if shart else B</code>.</p>",
        code: String.raw`son = -4
if son != 0:
    if son > 0:
        print("musbat")
    else:
        print("manfiy")

holat = "juft" if son % 2 == 0 else "toq"
print(holat)`,
      },
      {
        h: 'match — ko\'p tanlovli shart (Python 3.10+)',
        html: "<p>Bitta qiymatni ko'p variant bilan solishtirishda <code>match</code> qulay.</p>",
        code: String.raw`kun = 6
match kun:
    case 6 | 7:
        print("Dam olish kuni")
    case 1 | 2 | 3 | 4 | 5:
        print("Ish kuni")
    case _:
        print("Bunday kun yo'q")`,
      },
    ],
    quiz: [
      { q: "Pythonda kod bloki qanday belgilanadi?", options: ['{ } qavslar', 'begin/end', 'chekinish (bo\'sh joylar)', ';'], answer: 2, explain: 'Bloklar indentatsiya bilan belgilanadi.' },
      { q: 'x = 15 uchun: if x > 10: A elif x > 5: B — nima chiqadi?', options: ['A', 'B', 'A va B', 'hech narsa'], answer: 0, explain: 'Birinchi rost shart bajariladi, qolganlari tekshirilmaydi.' },
    ],
    tasks: [
      {
        title: 'Eng kattasi',
        desc: "<code>eng_katta(a, b, c)</code> funksiyasi tayyor. Uning ichini <code>if</code> yordamida to'ldiring (<code>max()</code> ishlatmang).",
        starter: String.raw`def eng_katta(a, b, c):
    # if/elif/else bilan eng katta sonni qaytaring
    pass

print(eng_katta(3, 9, 5))`,
        tests: String.raw`assert "max(" not in __code__, "max() ishlatmang — if bilan yozing"
for args, e in [((3, 9, 5), 9), ((10, 2, 7), 10), ((1, 2, 30), 30), ((4, 4, 4), 4), ((-1, -5, -3), -1)]:
    assert eng_katta(*args) == e, f"eng_katta{args} = {e} bo'lishi kerak, siz: {eng_katta(*args)}"`,
        hint: "if a >= b and a >= c:\n    return a\nelif b >= c:\n    return b\nelse:\n    return c",
      },
      {
        title: 'Tana vazni indeksi',
        desc: "<code>vazn</code> (kg) va <code>boy</code> (m) dan BMI = vazn / boy² ni hisoblang va <code>holat</code> ga yozing: 18.5 dan kam — <code>\"ozg'in\"</code>, 25 dan kam — <code>\"normal\"</code>, 30 dan kam — <code>\"ortiqcha\"</code>, aks holda <code>\"semiz\"</code>.",
        starter: String.raw`vazn = 70
boy = 1.75
holat = ""
print(holat)`,
        tests: String.raw`assert holat == "normal", "70 kg / 1.75 m uchun 'normal'"
for v, e in [(50, "ozg'in"), (85, "ortiqcha"), (100, "semiz")]:
    g = {}
    exec(__code__.replace("vazn = 70", f"vazn = {v}"), g)
    assert g["holat"] == e, f"{v} kg uchun {e!r} bo'lishi kerak"`,
        hint: "bmi = vazn / boy ** 2\nif bmi < 18.5:\n    holat = \"ozg'in\"\nelif bmi < 25:\n    holat = \"normal\"\n...",
      },
    ],
  },
  {
    id: 8, module: 2, title: 'while sikli', minutes: 15,
    intro: "Sikl — kodni bir necha marta takrorlash. while sikli shart rost bo'lguncha ishlaydi.",
    sections: [
      {
        h: 'Oddiy while',
        html: "<p>Har aylanishda shart tekshiriladi. Shartni o'zgartiruvchi qatorni unutmang, aks holda sikl <b>cheksiz</b> bo'lib qoladi!</p>",
        code: String.raw`i = 1
while i <= 5:
    print("Qadam", i)
    i += 1
print("Tugadi")`,
      },
      {
        h: "Yig'indi va hisoblagich",
        html: "<p>Sikllarda ko'pincha \"yig'uvchi\" o'zgaruvchi ishlatiladi.</p>",
        code: String.raw`n = 100
yigindi = 0
i = 1
while i <= n:
    yigindi += i
    i += 1
print(f"1 dan {n} gacha yig'indi: {yigindi}")`,
      },
      {
        h: "Foydalanuvchi to'xtatguncha",
        html: "<p><code>while True</code> va <code>break</code> — foydalanuvchi maxsus so'z yozguncha ishlaydigan dasturlar uchun klassik usul.</p>",
        code: String.raw`jami = 0
while True:
    s = input("Son kiriting (chiqish uchun 0): ")
    if s == "0" or s == "":
        break
    jami += int(s)
print("Jami:", jami)`,
      },
    ],
    quiz: [
      { q: 'i = 0; while i < 3: i += 1 — sikl necha marta aylanadi?', options: ['2', '3', '4', 'cheksiz'], answer: 1, explain: 'i = 0, 1, 2 uchun.' },
      { q: "Siklni darhol to'xtatuvchi kalit so'z?", options: ['stop', 'exit', 'break', 'return'], answer: 2, explain: 'break.' },
    ],
    tasks: [
      {
        title: 'Raqamlar soni',
        desc: "<code>raqamlar_soni(n)</code> funksiyasi musbat butun sonning nechta raqamdan iboratligini <code>while</code> bilan hisoblasin (<code>str()</code> va <code>len()</code> ishlatmang).",
        starter: String.raw`def raqamlar_soni(n):
    soni = 0
    # while bilan yozing
    return soni

print(raqamlar_soni(12345))`,
        tests: String.raw`assert "len(" not in __code__ and "str(" not in __code__, "str() va len() ishlatmang"
for n, e in [(12345, 5), (7, 1), (1000, 4), (987654321, 9)]:
    assert raqamlar_soni(n) == e, f"raqamlar_soni({n}) = {e}"`,
        hint: "while n > 0:\n    n //= 10\n    soni += 1",
      },
      {
        title: 'Kollats ketma-ketligi',
        desc: "<code>kollats(n)</code> n ni 1 ga yetguncha o'zgartirsin: juft bo'lsa 2 ga bo'linadi, toq bo'lsa <code>3n+1</code>. Funksiya nechta qadam ketganini qaytarsin (6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1: 8 qadam).",
        starter: String.raw`def kollats(n):
    qadam = 0
    return qadam

print(kollats(6))`,
        tests: String.raw`for n, e in [(6, 8), (1, 0), (7, 16), (27, 111)]:
    assert kollats(n) == e, f"kollats({n}) = {e}, siz: {kollats(n)}"`,
        hint: "while n != 1:\n    n = n // 2 if n % 2 == 0 else 3 * n + 1\n    qadam += 1",
      },
    ],
  },
  {
    id: 9, module: 2, title: 'for sikli va range()', minutes: 18,
    intro: "for sikli ketma-ketlikning (satr, ro'yxat, range) har bir elementi bo'ylab yuradi. Pythonda eng ko'p ishlatiladigan sikl.",
    sections: [
      {
        h: 'range()',
        html: "<ul><li><code>range(5)</code> → 0, 1, 2, 3, 4</li><li><code>range(2, 6)</code> → 2, 3, 4, 5</li><li><code>range(10, 0, -2)</code> → 10, 8, 6, 4, 2</li></ul>",
        code: String.raw`for i in range(5):
    print(i, end=" ")
print()
for i in range(10, 0, -2):
    print(i, end=" ")`,
      },
      {
        h: 'Satr va ro\'yxat bo\'ylab',
        html: "<p><code>for</code> istalgan ketma-ketlik bilan ishlaydi. <code>enumerate()</code> indeks va qiymatni birga beradi.</p>",
        code: String.raw`for harf in "Salom":
    print(harf)

mevalar = ["olma", "nok", "uzum"]
for i, meva in enumerate(mevalar, start=1):
    print(f"{i}. {meva}")`,
      },
      {
        h: 'Ko\'paytirish jadvali',
        html: "<p>Sikl ichida sikl — ichma-ich sikl. Tashqi siklning har bir qadamida ichki sikl to'liq aylanadi.</p>",
        code: String.raw`for i in range(1, 6):
    for j in range(1, 6):
        print(f"{i * j:4}", end="")
    print()`,
      },
      {
        h: 'else bloki siklda',
        html: "<p>Sikl <code>break</code>siz tugasa, <code>else</code> bloki bajariladi — qidiruvda qulay.</p>",
        code: String.raw`son = 29
for d in range(2, son):
    if son % d == 0:
        print(son, "tub emas, bo'luvchisi:", d)
        break
else:
    print(son, "— tub son")`,
      },
    ],
    quiz: [
      { q: 'list(range(1, 4)) natijasi?', options: ['[1, 2, 3, 4]', '[1, 2, 3]', '[0, 1, 2, 3]', '[2, 3, 4]'], answer: 1, explain: "Oxirgi qiymat kirmaydi." },
      { q: 'for i in range(3): for j in range(2): print() — print necha marta?', options: ['5', '6', '3', '2'], answer: 1, explain: '3 × 2 = 6.' },
    ],
    tasks: [
      {
        title: 'Faktorial',
        desc: "<code>faktorial(n)</code> funksiyasini <code>for</code> bilan yozing: n! = 1·2·…·n, 0! = 1.",
        starter: String.raw`def faktorial(n):
    natija = 1
    return natija

print(faktorial(5))`,
        tests: String.raw`for n, e in [(0, 1), (1, 1), (5, 120), (10, 3628800)]:
    assert faktorial(n) == e, f"faktorial({n}) = {e}"`,
        hint: "for i in range(2, n + 1):\n    natija *= i",
      },
      {
        title: 'Yulduzli uchburchak',
        desc: "<code>n = 4</code> bo'lsa, quyidagini chiqaring:<pre>*\n**\n***\n****</pre>",
        starter: String.raw`n = 4
`,
        tests: String.raw`assert out.rstrip("\n").split("\n") == ["*", "**", "***", "****"], f"Natija noto'g'ri:\n{out}"`,
        hint: 'for i in range(1, n + 1):\n    print("*" * i)',
      },
      {
        title: 'FizzBuzz',
        desc: "1 dan 15 gacha sonlarni chiqaring, lekin 3 ga bo'linadiganlari o'rniga <code>Fizz</code>, 5 ga — <code>Buzz</code>, ikkalasiga — <code>FizzBuzz</code>.",
        starter: '',
        tests: String.raw`exp = ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]
assert out.split() == exp, f"Kutilgan: {' '.join(exp)}\nSiz: {' '.join(out.split())}"`,
        hint: "for i in range(1, 16):\n    if i % 15 == 0:\n        print(\"FizzBuzz\")\n    elif i % 3 == 0: ...",
      },
    ],
  },
  {
    id: 10, module: 2, title: 'break, continue va sikllar bilan masalalar', minutes: 15,
    intro: "Siklni boshqarish va real masalalar: tub sonlar, eng katta umumiy bo'luvchi, raqamlar bilan ishlash.",
    sections: [
      {
        h: 'continue — qadamni o\'tkazib yuborish',
        html: "<p><code>continue</code> joriy aylanishning qolgan qismini tashlab, keyingisiga o'tadi.</p>",
        code: String.raw`for i in range(1, 11):
    if i % 3 == 0:
        continue
    print(i, end=" ")`,
      },
      {
        h: 'Tub sonlar',
        html: "<p>Son faqat 1 va o'ziga bo'linsa — tub. Tekshirish uchun √n gacha bo'luvchilarni ko'rish kifoya.</p>",
        code: String.raw`def tubmi(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True

print([n for n in range(1, 50) if tubmi(n)])`,
      },
      {
        h: 'Evklid algoritmi (EKUB)',
        html: "<p>Ikki sonning eng katta umumiy bo'luvchisi — 2300 yillik algoritm!</p>",
        code: String.raw`a, b = 48, 18
while b:
    a, b = b, a % b
print("EKUB:", a)`,
      },
    ],
    quiz: [
      { q: 'continue nima qiladi?', options: ["Siklni to'xtatadi", "Keyingi aylanishga o'tadi", 'Dasturni tugatadi', 'Hech narsa'], answer: 1, explain: "Joriy qadamni o'tkazib yuboradi." },
    ],
    tasks: [
      {
        title: 'Tub sonlar soni',
        desc: "<code>tub_soni(n)</code> 2 dan n gacha (n ham kiradi) nechta tub son borligini qaytarsin.",
        starter: String.raw`def tub_soni(n):
    return 0

print(tub_soni(30))`,
        tests: String.raw`for n, e in [(10, 4), (30, 10), (1, 0), (100, 25)]:
    assert tub_soni(n) == e, f"tub_soni({n}) = {e}, siz: {tub_soni(n)}"`,
        hint: "Har bir sonni tubmi() kabi funksiya bilan tekshiring va hisoblagichni oshiring.",
      },
      {
        title: 'Mukammal son',
        desc: "<code>mukammalmi(n)</code>: o'zidan kichik bo'luvchilari yig'indisi o'ziga teng bo'lsa <code>True</code> (6 = 1+2+3).",
        starter: String.raw`def mukammalmi(n):
    return False

print(mukammalmi(28))`,
        tests: String.raw`assert mukammalmi(6) and mukammalmi(28) and mukammalmi(496), "6, 28, 496 — mukammal"
assert not mukammalmi(12) and not mukammalmi(1), "12 va 1 — mukammal emas"`,
        hint: 'return n > 1 and sum(d for d in range(1, n) if n % d == 0) == n',
      },
    ],
  },

  // ======================= 3-MODUL =======================
  {
    id: 11, module: 3, title: "Ro'yxatlar (list)", minutes: 20,
    intro: "Ro'yxat — bir nechta qiymatni tartib bilan saqlaydigan, o'zgaruvchan to'plam. Pythonning eng muhim tuzilmasi.",
    sections: [
      {
        h: "Ro'yxat yaratish va elementlar",
        html: "<p>Ro'yxat kvadrat qavsda yoziladi. Indeks va kesish satrlardagidek ishlaydi, lekin ro'yxat elementlarini <b>o'zgartirish mumkin</b>.</p>",
        code: String.raw`baholar = [5, 4, 3, 5, 4]
print(baholar[0], baholar[-1])
print(baholar[1:3])
baholar[2] = 5
print(baholar, len(baholar))`,
      },
      {
        h: "Qo'shish va o'chirish",
        html: "<ul><li><code>append(x)</code> — oxiriga qo'shish</li><li><code>insert(i, x)</code> — i-o'ringa qo'shish</li><li><code>extend(l)</code> — boshqa ro'yxatni qo'shish</li><li><code>remove(x)</code> — qiymat bo'yicha o'chirish</li><li><code>pop(i)</code> — indeks bo'yicha olib tashlash (qaytaradi)</li></ul>",
        code: String.raw`mevalar = ["olma"]
mevalar.append("nok")
mevalar.insert(0, "anor")
mevalar.extend(["uzum", "shaftoli"])
print(mevalar)
mevalar.remove("nok")
oxirgi = mevalar.pop()
print(mevalar, "| olib tashlandi:", oxirgi)`,
      },
      {
        h: 'Saralash va qidirish',
        html: "<p><code>sort()</code> ro'yxatning o'zini saralaydi, <code>sorted()</code> esa yangi ro'yxat qaytaradi.</p>",
        code: String.raw`sonlar = [42, 7, 19, 3, 25]
print(sorted(sonlar))
print(sorted(sonlar, reverse=True))
sonlar.sort()
print(sonlar)
print(19 in sonlar, sonlar.index(19))
print(sum(sonlar), max(sonlar), min(sonlar))`,
      },
      {
        h: '⚠ Nusxa olish',
        html: "<p><code>b = a</code> nusxa emas — ikkala nom bitta ro'yxatga ishora qiladi. Nusxa uchun <code>a.copy()</code> yoki <code>a[:]</code>.</p>",
        code: String.raw`a = [1, 2, 3]
b = a
c = a.copy()
a.append(4)
print("b:", b)   # o'zgardi!
print("c:", c)   # o'zgarmadi`,
      },
    ],
    quiz: [
      { q: 'l = [1, 2, 3]; l.append([4, 5]); len(l)?', options: ['5', '4', '3', 'xato'], answer: 1, explain: "append bitta element (ro'yxat) qo'shadi." },
      { q: "sorted(l) va l.sort() farqi?", options: ['Farqi yo\'q', "sorted yangi ro'yxat qaytaradi", "sort yangi ro'yxat qaytaradi", 'sorted faqat sonlar uchun'], answer: 1, explain: "l.sort() o'zini o'zgartiradi va None qaytaradi." },
    ],
    tasks: [
      {
        title: 'Musbatlar',
        desc: "<code>musbatlar(l)</code> ro'yxatdagi faqat musbat sonlardan iborat yangi ro'yxat qaytarsin.",
        starter: String.raw`def musbatlar(l):
    natija = []
    return natija

print(musbatlar([3, -1, 0, 8, -5, 2]))`,
        tests: String.raw`assert musbatlar([3, -1, 0, 8, -5, 2]) == [3, 8, 2], "[3, 8, 2] bo'lishi kerak"
assert musbatlar([]) == [] and musbatlar([-1, -2]) == []`,
        hint: "for x in l:\n    if x > 0:\n        natija.append(x)",
      },
      {
        title: 'Ikkinchi eng katta',
        desc: "<code>ikkinchi_katta(l)</code> ro'yxatdagi ikkinchi eng katta <b>turli</b> qiymatni qaytarsin. <code>[4, 9, 9, 7]</code> → 7.",
        starter: String.raw`def ikkinchi_katta(l):
    pass

print(ikkinchi_katta([4, 9, 9, 7]))`,
        tests: String.raw`assert ikkinchi_katta([4, 9, 9, 7]) == 7
assert ikkinchi_katta([1, 2]) == 1
assert ikkinchi_katta([-5, -1, -3]) == -3`,
        hint: 'return sorted(set(l))[-2]',
      },
    ],
  },
  {
    id: 12, module: 3, title: "Ro'yxatlar bilan ishlash: ichma-ich, zip, matritsa", minutes: 15,
    intro: "Ro'yxat ichida ro'yxat (jadval), parallel ro'yxatlar bilan zip() va eng ko'p uchraydigan amallar.",
    sections: [
      {
        h: 'Ikki o\'lchamli ro\'yxat (matritsa)',
        html: "<p>Jadvalni ro'yxatlar ro'yxati sifatida saqlash mumkin: <code>m[qator][ustun]</code>.</p>",
        code: String.raw`m = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
print(m[1][2])          # 6
for qator in m:
    print(*qator)
print("Diagonal:", [m[i][i] for i in range(3)])`,
      },
      {
        h: 'zip() — parallel ro\'yxatlar',
        html: "<p><code>zip()</code> bir nechta ro'yxatning mos elementlarini juftlab beradi.</p>",
        code: String.raw`ismlar = ["Ali", "Vali", "Gul"]
ballar = [87, 92, 78]
for ism, ball in zip(ismlar, ballar):
    print(f"{ism:6} {ball}")
print(dict(zip(ismlar, ballar)))`,
      },
      {
        h: "Ro'yxatni yoyish (unpacking)",
        html: "<p><code>*</code> bilan qolgan elementlarni bitta o'zgaruvchiga yig'ish mumkin.</p>",
        code: String.raw`birinchi, *orta, oxirgi = [10, 20, 30, 40, 50]
print(birinchi, orta, oxirgi)
print(*[1, 2, 3], sep=" | ")`,
      },
    ],
    quiz: [
      { q: 'm = [[1, 2], [3, 4]]; m[1][0]?', options: ['1', '2', '3', '4'], answer: 2, explain: '1-qator (ikkinchi), 0-ustun.' },
    ],
    tasks: [
      {
        title: 'Matritsani transponirlash',
        desc: "<code>transpose(m)</code> qatorlarni ustunlarga aylantirsin: <code>[[1,2,3],[4,5,6]]</code> → <code>[[1,4],[2,5],[3,6]]</code>.",
        starter: String.raw`def transpose(m):
    pass

print(transpose([[1, 2, 3], [4, 5, 6]]))`,
        tests: String.raw`assert transpose([[1, 2, 3], [4, 5, 6]]) == [[1, 4], [2, 5], [3, 6]]
assert transpose([[1]]) == [[1]]
r = transpose([[1, 2], [3, 4]])
assert isinstance(r[0], list), "Natija ro'yxatlar ro'yxati bo'lsin (tuple emas)"`,
        hint: 'return [list(q) for q in zip(*m)]',
      },
    ],
  },
  {
    id: 13, module: 3, title: "Kortej (tuple) va to'plam (set)", minutes: 15,
    intro: "tuple — o'zgarmas ro'yxat, set — takrorlanmas elementlar to'plami. Ikkalasining ham o'z vazifasi bor.",
    sections: [
      {
        h: 'tuple',
        html: "<p>Kortej oddiy qavsda yoziladi va yaratilgandan keyin <b>o'zgartirib bo'lmaydi</b>. Koordinatalar, sanalar kabi o'zgarmas ma'lumotlar uchun qulay; funksiya bir nechta qiymat qaytarganda ham tuple ishlatiladi.</p>",
        code: String.raw`nuqta = (3, 4)
x, y = nuqta
print(x, y, len(nuqta))

def min_max(l):
    return min(l), max(l)   # tuple qaytaradi

kichik, katta = min_max([5, 2, 9])
print(kichik, katta)`,
      },
      {
        h: 'set',
        html: "<p>To'plam figurali qavsda yoziladi, elementlar <b>takrorlanmaydi</b> va tartibsiz. Takrorlarni olib tashlash va tez qidirish uchun ideal.</p>",
        code: String.raw`s = {3, 1, 3, 2, 1}
print(s)
s.add(10)
s.discard(1)
print(s, 2 in s)
print(len(set("mississippi")))   # nechta turli harf`,
      },
      {
        h: "To'plamlar ustida amallar",
        html: "<p><code>|</code> birlashma, <code>&amp;</code> kesishma, <code>-</code> ayirma, <code>^</code> simmetrik ayirma.</p>",
        code: String.raw`python = {"Ali", "Vali", "Gul", "Sardor"}
js = {"Gul", "Sardor", "Laylo"}
print("Ikkalasi:", python & js)
print("Hammasi:", python | js)
print("Faqat Python:", python - js)`,
      },
    ],
    quiz: [
      { q: 'len({1, 1, 2, 2, 3})?', options: ['5', '3', '2', 'xato'], answer: 1, explain: "Takrorlar olib tashlanadi: {1, 2, 3}." },
      { q: "t = (1, 2); t[0] = 5 — nima bo'ladi?", options: ['t = (5, 2)', 'TypeError', 't = (1, 2, 5)', "hech narsa"], answer: 1, explain: "Kortej o'zgarmas." },
    ],
    tasks: [
      {
        title: 'Takrorlarsiz (tartib saqlangan holda)',
        desc: "<code>takrorsiz(l)</code> takrorlangan elementlarni olib tashlasin, lekin birinchi uchragan tartibni saqlasin: <code>[3, 1, 3, 2, 1]</code> → <code>[3, 1, 2]</code>.",
        starter: String.raw`def takrorsiz(l):
    pass

print(takrorsiz([3, 1, 3, 2, 1]))`,
        tests: String.raw`assert takrorsiz([3, 1, 3, 2, 1]) == [3, 1, 2]
assert takrorsiz(["b", "a", "b"]) == ["b", "a"]
assert takrorsiz([]) == []`,
        hint: "Ko'rilganlarni set'da saqlang:\nkorilgan = set()\nnatija = []\nfor x in l:\n    if x not in korilgan: ...",
      },
      {
        title: 'Umumiy harflar',
        desc: "<code>umumiy(a, b)</code> ikki so'zda ham uchraydigan harflarni alifbo tartibida satr qilib qaytarsin: <code>umumiy(\"salom\", \"olma\")</code> → <code>\"alm o\"</code> emas, <code>\"almo\"</code>.",
        starter: String.raw`def umumiy(a, b):
    pass

print(umumiy("salom", "olma"))`,
        tests: String.raw`assert umumiy("salom", "olma") == "almo", f"'almo' bo'lishi kerak, siz: {umumiy('salom', 'olma')!r}"
assert umumiy("abc", "xyz") == ""`,
        hint: 'return "".join(sorted(set(a) & set(b)))',
      },
    ],
  },
  {
    id: 14, module: 3, title: "Lug'atlar (dict)", minutes: 20,
    intro: "Lug'at — kalit: qiymat juftliklari. Telefon kitobi, foydalanuvchi profili, so'zlar statistikasi — barchasi lug'at bilan qulay.",
    sections: [
      {
        h: "Lug'at yaratish va o'qish",
        html: "<p>Qiymatga indeks emas, <b>kalit</b> orqali murojaat qilinadi. <code>get()</code> kalit bo'lmasa xato bermaydi.</p>",
        code: String.raw`talaba = {"ism": "Laylo", "yosh": 19, "kurs": 2}
print(talaba["ism"])
print(talaba.get("telefon", "kiritilmagan"))
talaba["yosh"] = 20          # o'zgartirish
talaba["shahar"] = "Buxoro"  # yangi kalit
del talaba["kurs"]
print(talaba)`,
      },
      {
        h: "Lug'at bo'ylab yurish",
        html: "<p><code>keys()</code>, <code>values()</code>, <code>items()</code>.</p>",
        code: String.raw`narxlar = {"non": 4000, "sut": 12000, "choy": 25000}
for mahsulot, narx in narxlar.items():
    print(f"{mahsulot:6} {narx:>7,} so'm")
print("Jami:", sum(narxlar.values()))
print("Eng qimmati:", max(narxlar, key=narxlar.get))`,
      },
      {
        h: "Sanash — lug'atning klassik vazifasi",
        html: "<p>Matndagi so'zlar necha marta uchrashini hisoblash.</p>",
        code: String.raw`matn = "olma nok olma uzum nok olma"
soni = {}
for soz in matn.split():
    soni[soz] = soni.get(soz, 0) + 1
print(soni)

from collections import Counter
print(Counter(matn.split()).most_common(2))`,
      },
      {
        h: "Ichma-ich lug'atlar",
        html: "<p>Real ma'lumotlar ko'pincha lug'at ichida lug'at yoki ro'yxat ko'rinishida bo'ladi (JSON ham shunday).</p>",
        code: String.raw`sinf = {
    "Ali": {"matem": 5, "fizika": 4},
    "Gul": {"matem": 4, "fizika": 5},
}
for ism, fanlar in sinf.items():
    ortacha = sum(fanlar.values()) / len(fanlar)
    print(ism, ortacha)`,
      },
    ],
    quiz: [
      { q: 'd = {"a": 1}; d.get("b", 0)?', options: ['None', '0', 'KeyError', '"b"'], answer: 1, explain: "Kalit yo'q — standart qiymat qaytadi." },
      { q: "Lug'at kaliti qaysi bo'la olmaydi?", options: ['satr', 'son', "ro'yxat", 'tuple'], answer: 2, explain: "Kalit o'zgarmas (hashable) bo'lishi kerak; ro'yxat o'zgaruvchan." },
    ],
    tasks: [
      {
        title: 'Harflar chastotasi',
        desc: "<code>chastota(s)</code> satrdagi har bir harf (bo'sh joydan tashqari) necha marta uchrashini lug'at qilib qaytarsin.",
        starter: String.raw`def chastota(s):
    natija = {}
    return natija

print(chastota("ana bor"))`,
        tests: String.raw`assert chastota("ana bor") == {"a": 2, "n": 1, "b": 1, "o": 1, "r": 1}, f"Siz: {chastota('ana bor')}"
assert chastota("") == {}`,
        hint: "for h in s:\n    if h != \" \":\n        natija[h] = natija.get(h, 0) + 1",
      },
      {
        title: "Lug'atni teskari aylantirish",
        desc: "<code>teskari(d)</code> kalit va qiymatlar o'rnini almashtirsin: <code>{\"a\": 1, \"b\": 2}</code> → <code>{1: \"a\", 2: \"b\"}</code>.",
        starter: String.raw`def teskari(d):
    pass

print(teskari({"a": 1, "b": 2}))`,
        tests: String.raw`assert teskari({"a": 1, "b": 2}) == {1: "a", 2: "b"}
assert teskari({}) == {}`,
        hint: 'return {v: k for k, v in d.items()}',
      },
    ],
  },
);
