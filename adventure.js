'use strict';
window.FrontierAdventure=(()=>{
 const general=[['abandoned_cart','傾倒的運輸車','零件','material','iron',3],['sealed_lab','封閉的實驗室','支付8源石碇 取得研究裝置','research','device',8],['wounded_runner','負傷信使','交出戰地急救包 ×1，取得情報','medicine','',1],['broken_bridge','斷橋旁的路標','消耗6源石碇 修路並偵察；略過需繞行（偏移路線、警戒+1）','scout','',6],['quiet_market','低聲交談的集市','交涉降低風險','negotiate','',0],['water_cache','封存的飲水','補充飲水或緩解地區環境負擔','cleanse','',0],['supply_ledger','遺落的帳本','情報+3','intel','',3],['ore_seam','淺層礦脈','開採礦石並增加暴露','mine','rock',5],['old_barricade','可利用的路障','下場開局護盾','barrier','',3],['radio_fragment','斷續電台','偵察訊號','scout','',0],['field_clinic','移動診所','支付10源石碇 全隊治療','heal','',10],['damaged_crate','損壞的物資箱','取得戰地急救包','supplies','',1],['sponsor_offer','匿名贊助','接受曝光，取得源石碇','sponsor','',15],['warning_marks','刻在牆上的警告','放慢行動降低危機','cleanse','',0],['family_letter','家族密信','送信改變關係','family','',0],['engineer','孤身的工程師','獲得補給情報','scout','',0],['battlefield','新近停火的戰壕','支援戰線取得補給','front','iron',3],['lighthouse','熄滅的小燈塔','穩定潮汐並解除神經異常','lighthouse','',0],['anomaly_log','異常記錄殘頁','換取知識並接觸坍縮','anomaly','',3],['contract_echo','戰場上的殘響','自願簽約：出牌傷害＋15%，加入負面牌','pact','',0]];
 const snow=[['snow_shelter','雪線避難所','取暖降低3寒冷','cleanse','',0],['frozen_rations','凍結的補給','支付5源石碇 換醫療品','paidSupply','',5],['bell_keeper','守鐘人','換取2情報','intel','',2],['ice_canyon','冰谷風口','偵察可通行的支路','scout','',0],['heated_pipe','殘留熱源','取暖降低3寒冷','cleanse','',0],['mountain_herbs','雪下藥草','取得戰地急救包','supplies','',1],['pilgrim','迷路的朝聖者','交出戰地急救包 ×1，交換情報','medicine','',1],['rail_shed','封凍的軌道棚','獲得補給情報','scout','',0],['survey_flag','探勘隊旗標','取得白階研磨石','material','grindstone',3],['snow_warning','即將來臨的白災','及早降低3寒冷','cleanse','',0]];
 const eventRegions={sponsor_offer:'kazimierz',family_letter:'siracusa',battlefield:'victoria',lighthouse:'iberia',anomaly_log:'sami',contract_echo:'kazdel'};
 const events=Object.fromEntries([...general,...snow].map(([id,title,choice,effect,family,value])=>[id,{id,title,choice,effect,family,value}]));

 const regionalScenes={
  chernobog:[
   '倒掛的車票：售票機還在替昨天的班次吐票|鏽軌的缺口：殘骸露出可穿行的維修梯|未寄出的路線圖：信箱下面壓著整條地鐵線|搬不走的告示：牆上的箭頭與街道方向相反|逆行指標：地底行車燈指向封存月台',
   '玻璃雨棚：碎玻璃底下堆著完整的零件|無主的工具牌：清潔工留下領用憑證|半截輸送帶：滑槽還卡著裝卸班的貨籃|封閉的電梯：停在半層樓的轎廂透出光|失物處的鑰匙：每把鑰匙都只有編號',
   '沖洗走廊：去污泵還剩一輪水壓|黃色膠帶：舊防疫區的安全線突然亮燈|負壓玻璃房：內外壓力錶都卡在紅區|翻倒的消毒車：車底的閥門尚未鎖死|隔離窗：守門人把濾罐從窗縫遞出',
   '交換日期：鐘錶匠願為昨天的訊息付錢|樓門管理費：住戶用碎票修補公寓的樓梯|夜班收據：餐車仍認得工廠的排班代號|清點電池：廢品販把有電與沒電的罐子混在一起|浮橋欠條：過河的人都在木板下面簽名',
   '封好的醫囑：門診留下匿名服藥盤|煤庫火種：守夜人邀隊伍在爐前坐一會|走廊擔架：兩條安全帶間露出新的繃帶|舊校水塔：孩子用課表標記淡水分配|壞掉的急救箱：扣件損毀但包裹完好',
   '不能停的風扇：只要停機就有機會取出機心|壁後人聲：有人能回答警報器收到的呼號|雪下磁帶：放音孔被凍霜堵死|空教室的電台：調頻後傳來不在圖上的座標|工廠的交班鐘：敲響後有東西從滑道落下'
  ],
  lungmen:[
   '雨後天橋：橋柱上的維修色帶指向盲區|閉店地圖：店主把巡邏路線畫進菜單|北匝道：每換一次方向交通燈就閃白|公車末班站：站牌新增了一個無名停靠點|檔案投遞口：公文袋裡有施工換道表',
   '修鞋攤：師傅的工具櫃裡多了一只密盒|貨運行李架：第五格有一張未作廢的領物單|反光背心：口袋裡的章屬於已撤離的工頭|雜貨船過磅：船主急著清出一箱散件|未領的外賣：保溫袋裡放的是替換裝備',
   '換哨名單：告示板公布了一段無人盤查時間|油紙傘：賣傘人認得通緝公文的錯字|社區鐘聲：巡查隊正往鐘樓另一側集合|清空的收費站：閘桿升起的時間比紀錄晚|水路借道：駁船願意遮住甲板上的識別碼',
   '落地窗招租：大樓管理員重金徵求內部路況|夜市零錢：攤販為找零開出兩個價碼|碼頭班表：船行願為落水吊鉤付報酬|茶館寄單：客人的信封壓在記帳板下|短工訂金：工頭需要有人看一眼貨櫃封條',
   '街口帆布：救護志工正在集中剩餘藥品|無字藥櫃：藥師用瓶蓋顏色區分用途|送餐車歇火：熱湯與急救包都還在車上|樓梯轉角的窗：住戶空出一處躲雨位置|市集盲巷：修補匠備著兩種應急布包',
   '深巷的復刻章：印章與公文末尾的圖案相同|不熄的招牌：店牌閃爍的間隔像一組數字|兩段口令：守門人只聽過口令的前半|隔著珠簾：有人用不屬於本區的錢買路|編號缺一：寄存處的號牌漏了指定貨格'
  ],
  siesta:[
   '海岸避難牌：降落的灰掩住第二條路|沙丘外的旗：三面旗指示兩處不同風向|觀測員跑步道：熱像儀標著退潮後可走的線|步道斷層：火山灰上留下新腳印|浮標校正：編號錯位使地圖多出一段海岸',
   '熔平的手推車：車床下隔熱閥尚可使用|熄火燒烤架：架子裡有觀測隊封好的零件|演出器材箱：音箱接頭被換成工業插口|看台下漆桶：鋼架間藏著防焰面的罐子|傾斜的熱鐘：拆下底座才看得見刻字',
   '噴泉的最後一輪：水池能收集短暫冷水|停用遊客中心：管理員還能重啟通風|隧道裡的風：清潔車擋住通往陰面的小路|水上救生台：冷水壺和驅灰罩掛在碼頭|旅店後窗：房客留了一套耐灰濾芯',
   '熱源保證金：觀測隊想買走小型熱像片|濱海寄物牌：退款期限剛好是今天|缺席的樂手：經理為送回樂譜準備了報酬|未開唱的舞台：支出單上留著備用錢|砂地記分板：舊遊戲攤還剩獎池',
   '涼棚裡的鹽水：救護員正在分裝鹽袋|紅葉浮冰：保冷箱上貼著兩張用法|後台的小醫務室：醫師把紗布移到風扇旁|黑沙拖鞋：一雙乾鞋留在救護帳外|岸邊的水滋聲：水泵旁堆著防燙用品',
   '未響的測震鐘：鐘錘停在刻線之前|沉石的熱紋：金屬探針在接觸前先發白|空杯裡的煙：店家認不得杯底的標記|一號觀測坑：坑口傳回陌生人的敲擊|礁後電纜：線延伸到觀測圖外'
  ],
  sargon:[
   '逆風足印：新痕跡避開了風口|岩陰的刻度：刻痕比驛站時鐘準|商道雙標：一組旗籠指天，一組指地|沙脊之下：背風面露出舊時哨亭|褪色流向圖：飲水點被改成另一處',
   '繫帶皮箱：皮箱扣上拴著一顆配重|石槽金管：塞子刻著淘洗工符號|落沙的測距鏡：信標旁配件仍乾淨|沙下的捆紮：一捆物資結成拖曳形狀|廢井升降機：滑輪下壓著完好的銘牌',
   '井蓋下的涼氣：水位高於廢棄標線|十三口的水甕：掌櫃只給現場開封|防沙帆的背面：廢驛站收集了一夜露水|鹽燈暗渠：沿濕泥可以找到水管|碎瓦水脈：窯工在屋後保留蓄水盆',
   '沙路的抵押：趕路人用貨款贖回路書|銀袋標籤：兩支駝隊都在找丟貨人|風向賬：領隊為避風座標開出價錢|曬棚稅簿：守帳人想要清點正確的車數|焦木算盤：木片記的全是可兑現的欠條',
   '白布口袋：旅行醫療箱比駝鞍更沉|砂鍋上的手印：居民準備了補水鹽與膠帶|駝袋裡的止血布：水袋旁另有隔層|帆布的裂口：修剪後還能用作護具|守井人請客：送來的茶壺底墊是藥包',
   '會動的陶罐：熱風停下後罐口仍顫|日影倒轉：一座舊錶在正午後指北|雙蛇容器：封蠟一面乾燥一面出汗|鐘槌裡的石籤：老聲音可以換得新探問|落在地上的星圖：陌生星位只在沙面反光'
  ],
  kazimierz:[
   '封閉跑道：播報修正了返場動線|替補員通道：工牌能指出遠離鏡頭的門|不計分的分段：舊記錄台多出一張路線表|盲區闸門：示範地圖與實際出口不同|攝影頂棚：燈架維修工放下安全繩',
   '碎裂的獎杯座：底座是帶鎖的儲物格|失格騎士護具：狹縫裡夾著一張取貨單|沒有名字的旗手：旗袋藏著舊隊伍的器械|場務車的死角：折椅後剩下一箱貨|熄掉的計時器：儲存卡還連在補給閘',
   '提前散場：播報員願把你們排出鏡頭|賽道背板：背景布足以遮住小隊|沒記入賽程：臨時賽事的報名位置可以劃掉|延遲五秒：轉播車能晚一點送出你的位置|錯字的名冊：只要改一行就能換回匿名',
   '無署名的贊助：代理人正尋找選手接洽|舊騎士徽票：兌換處開到最後一刻|場內折扣券：票員願收回未使用的票根|同分的兩個賠率：售票窗後會計重新數錢|後台小費箱：一張單子按貢獻分錢',
   '護腕的縫針：裁縫也能給傷口縫線|巡場醫務亭：兩種新敷料還沒登記|賽後補水桌：水杯旁有包裝乾淨的繃帶|空休息室：更衣員給隊伍留出長凳|騎士的止痛罐：內盒分成快慢兩格',
   '不平的落槌：評判員問你是否查看底稿|招牌上的空甲：盔甲裏的錄音仍在播放|選手的假名：接頭人願用一次試驗換真章|試劍館的木人：胸口卡住一件贈品|鎖門的證人：半張票可換來整份證詞'
  ],
  kjerag:[
   '雪坡繫索：最後一節繩索落向短谷|煤渣方向標：鐵路人用煤堆作路標|結霜站牌：除去霜後露出舊候車線|山隘影圖：雪反射出崖背輪廓|鐘波刻度：先聽回音就能知道窄谷方向',
   '車廂煤箱：備件還放在沒用完的煤裡|雪槽鉚釘：橇滑過後露出小匣|抹灰的鐵箍：內側蓋著雪地運輸碼|懸崖吊桶：繩頭夾了尚可使用的鉗頭|倉房雪閘：閘縫掉下一批備用品',
   '蒸汽埠：凍住的接管可以繞行通氣|背風驛站：站長留下乾柴和兩塊火板|織毯的北牆：厚毯後藏有暖氣孔|冰柱間的亮窗：居民願借出半箱熱煤|無人守的爐房：爐膛還亮著微紅',
   '雪裡的結算簿：貨棧願為確認庫存付錢|空纜車票：終點站還收已廢除的票|馬廄零工：守門人找人清點食料|供燈測算：巡修班為傳一條訊息付費|堆雪午餐券：廚房願收回過期券',
   '草藥的灰袋：老人請人先把草灰篩開|去往暖室的托盤：醫務員把補給留在門口|御寒袖套：袖口有專供凍傷的急救包|靜置的雪橇：車上擱著兩份暖身劑|被換走的門鎖：屋內寢位還保持整潔',
   '風裡的鐘匙：沒有人接手看守的任務|灰燼下的紙鳥：獸皮盒能隔絕風雪|冰眼的碎鏡：鏡面映出另一間暖房|落石傳話筒：筒裡是未登錄的雪線回聲|守過夜的旗：長釘下密封著一個選擇'
  ],
  siracusa:[
   '被遮住的街牌：兩條街被塗成同一個名字|麵粉路上的線：白粉指向沒有掩門的內巷|亞麻桌布：洗不掉的線條拼成路圖|石牆門牌：一枚鐵釘標著通往後院的口|道口掛號簿：今晚換了另一組人守橋',
   '沒裝酒的桶：桶底夾著一副備用扣|鎖在臘腸上的匙：屠夫指向棚後寄櫃|唱片店架子：一排唱片盒中只有一盒有重量|錯料的木箱：送貨人搬來一個誰也不認領的箱|晚宴的隔熱盤：層架下放著硬殼裝具',
   '未動的餐具：靠街一桌代表家族之間的停火|彩繩結：有人願代你拆掉敵意標記|換貨的家徽：不同顏色意味兩種交涉對象|洗掉的名字：洗衣鋪能掩去通緝圖樣|廚房的側門：廚工趁兩家交班放行',
   '月底的花帳：麵包師把欠款分在兩頁|無人登台的歌劇：票口願代收一筆費用|硬幣藏在磚下：店長為找到暗格支付謝金|凌晨外送單：收件人要先核對路名|四把傘的收入：雨商想換回家族舊票',
   '冷掉的湯：矮桌另一端留著醫療繃帶|綠瓶的節奏：藥房店員用敲瓶分辨配方|換牆上的布：走廊角落備著一整疊布卷|小巷盒飯：攤主請隊伍先坐下喘一口氣|露臺灰籃：毛巾下面壓著密封藥袋',
   '唱針奪走的聲音：有人問你要留下哪段談話|狗群突然噤聲：夜行送信人在屋檐底下招手|未封口的家書：寫信人塗掉了一個稱號|青皮信箱：投信後有暗門打開|最後一席：晚宴座位留給不在名冊上的人'
  ],
  columbia:[
   '搶修定位釘：陽極標號指示維護路線|廢棄感測線：牆背線纜通往沒有監控的門|雙重許可證：過期的一張反而標著捷徑|自動扶梯的尾站：電子圖比扶梯晚停止|保險圖層：底圖上另有一條撤離線',
   '未續約的掃描器：售後間留了整套鏡片|擱置的樣品管：管帽刻著同一批貨號|一聲短鳴：零件箱還在等待入庫|反接的小電箱：背板裡收著檢測組件|半開的壓力室：臨時閥被塞在提箱中',
   '下一個維修窗：斷網時間比通告長|白屏保安機：主程式允許臨時停用|倒灌的冷風：設備降溫也能停止干擾|屏蔽區午休牌：標籤指出一段安全站|多餘的阻波器：技師願借出備件',
   '報廢補貼：舊設備仍有回收價|臨時風險津貼：負責人願簽施工單|客戶遺忘的代碼：門房按提交單發費|硬碟逾期費：商務櫃檯想收回未銷號的碟|出口交接券：托運服務有兩種退款',
   '廠區醫護櫃：未亮燈的格子也有急救品|易碎送達：合成凝膠外包沒有損壞|緊鄰的洗眼台：保安的物資放在擋板後|實驗衣的內袋：密封膜包著備用醫療品|雙層休息艙：外側玻璃設有臨時診台',
   '反序的報告頁：簽名比立案早了三天|光標跳出屏幕：輸入端顯示未知裝置|連到空座的耳機：耳機另一端有人值守|沒有開關的樣機：要用兩個接點啟動|只能聽一遍的快報：研究員不能再播一次'
  ],
  victoria:[
   '撤離手繪圖：橋頭兩個碼對應兩段壕溝|工兵的網格紙：道路只在敵情空隙安全|教堂側翼刻痕：敵我都沒發現下面通路|通訊霧旗：代號寫在乾燥的一面|窄橋放行：車輪痕跡比哨所標線新',
   '補給車斷軸：散落軍物仍帶可認的貨條|團部遺失櫃：外鎖不見但封印還在|炮位配件箱：箱旁留一張撤退便箋|避難區的運料板：屋角的螺絲仍分好類|對不上編號的桶：油早搬走而板凳下有零件',
   '漏寫的一班守備：聯絡兵提醒一道防線缺人|停火窗口：雙方標記存在短暫重疊|空無一人的樓塔：由塔頂打旗可修正火線|沒有旗幟的救護點：居民願代為傳遞情報|沙袋糧倉：多出一段能供支援的牆',
   '軍票延期：收貨人用現金替代延期軍票|寄存在酒館的工錢：酒保按點名發還|短程運輸契約：車隊找人幫忙讀路牌|畫反的糧單：商人願付錢拿到正確紙本|檢查通報酬：守衛邀請隊伍做一次見證',
   '藍布擔架：乾燥醫材藏在舊傷員座下|衣櫃的軍醫箱：箱面有兩副姓名貼紙|硬餅的香味：警戒塔下的伙房仍在工作|壕溝暖角：有人剛燒開用來清洗的水|拼接雨衣：醫工把內襯切成繃帶',
   '錯過終點的指令：信使請你決定投遞順序|回傳舊口令：對方只知道四年前的一半|塌牆上印有手掌：牆後的桌子有密匣|煤渣掩住宣令書：按印未必來自團部|上膛的信號槍：彈筒底刻著民兵區短碼'
  ],
  iberia:[
   '灘塗石標：石背的刻度標出最短退水道|淺灘上留白：探路人的圖漏掉一條粗線|吊鐘的影子：落下的影子筆直指向海堤|瓶中沙線：瓶口指向較乾的礁帶|小折塔基座：潮水下面有短程引線',
   '可抬起的潮墓：石蓋下有港務工具|漂來的罐托：袋子打的是守塔人結|不鏽的鐵鉤：鉤尾標著未登記貨籃|漁網裡的硬物：一截金屬不沾海藻|反繫的捕魚籠：有鉛殼的物件卡在底部',
   '整齊的漲潮線：潮務員能指一條幾乎不濕的暗路|浮筒排氣聲：海工等壓力表合格才開閘|岸燈沒有罩子：守燈人留了一份乾燥海況表|鹹水尺的箭頭：維護工發現水尺插反|斷崖的搖輪：手輪能提起一段防潮門',
   '港務損失單：抄寫員願付費取得潮位紀錄|鹽花收買：貨商找人鑑定未化開的結晶|離港八點：船工急需找回遺失的牌|風乾的欠據：兩筆款項只有一筆仍有效|最後班渡艇：艙長讓你代為轉交酬金',
   '魚骨棚下的帆：乾帆中裹著穩頻零件|深水裝上的耳罩：商隊給隊伍一件測試品|冷了的鹽粥：老漁人藏著備用藥|隔牆個人信箱：醫療包被風浪沖上來|乾燥的避雨角：地面還未被海潮沾濕',
   '無聲的航海片：片面能看到反射的航道|井中與海同高：水下有只仍亮著的小匣|接不到的船鐘：每次搖都從另一邊傳聲|牽在棧橋的空線：有人借此寄出回聲|沒有人認的銘牌：牌角卻刻了你的時間'
  ],
  sami:[
   '枝梢的黑雪：雪只在安全走向的一側融化|滑道上四種爪印：有一種來自勘察隊|畸長的落影：相對移動才會顯現正路|回收的白旗：旗臂縫了新的座標|腳印盡頭的角：地面長出一個可作標記的石尖',
   '伐木簽收箱：裡面沒有木頭而是儀器|纏紅線的蓋桶：桶蓋下面有另一層包裝|凍在坡邊的天線：分線頭未被打濕|鼷獸洞口的皮包：皮包上沒留牙印|嵌在鹿角間的鉤：鉤頭刻著過夜標誌',
   '靜得可疑的黑雨：棚主還能檢修複讀器|折返的雪祀：兩段祝詞中一段能讓路安靜|靠牆的日晷：調整面向能辨別真假回波|試紙不變色：勘察員願幫忙再校一遍|沒有回音的盆地：安靜三十秒就能找回定位',
   '林場不銷帳：保管員願代付回收預算|換皮草的刻碼：兩家攤主認不同圖案|封存的供貨罐：取貨價依收據決定|隔雪的物資費：住民只收防潮紙票|拖曳場上的下注牌：記分人給了外來客一份資助',
   '最後一批暖鹽：技師等著人交出空罐|坐在冰上的獸：旁邊的藥箱被牠捂暖|樹液布卷：有人用它保護過勘察器|紅色柴火：救護隊用安全火點暖棚|沒有融雪的軌跡：雪傘底下是乾燥床位',
   '拼不合的白板：最小一角總是多出來|樹樁內的十個聲音：其中一個說了正確的方位|昨夜的未來訊號：收音員問你是否去追|啟示的空格：圖符在潮濕時會換一列|倒轉的冬日：照片中同一棵樹有兩種年輪'
  ],
  kazdel:[
   '爐壁的借道字：刻痕指向熔爐旁的舊巷|空白族譜末頁：離開路線夾在最後一代|草繩圖釘：屋主用繩結代替方向文字|暗色塔磚：僅一塊磚不曾被翻過|記路人的炭筆：只有長線可以安全跟隨',
   '碎劍山的盒：兩支劍柄吊住物資口袋|織錦座的簽標：殘卷包著比書更硬的物件|琢形的鐵轡：放開繩結就會露出夾層|被換過的遺箱：背面帶有一個秘密扣|飛鋸託運：繫在頭頂的貨袋落進空院',
   '敲滅的回聲：守灶人知道一種短的靜音儀式|空椅旁的蠟：讓空椅遠離爐火可安定幻象|石面兩份記憶：刻手請你抹去多餘片段|黎明借一場靜默：牧人挑了一處安全火堆|三聲鐘後：停下來能讓戰地回聲消散',
   '用舊記憶抵價：商人給唱片編了流水號|風車欠單：村民願用錢換回斷翼消息|鑄工的刻時器：還留著一筆無人認領的工資|巡遊戲票：班主為失去的吊籠尋找見證|搬爐工的分配表：有兩筆提前存入的款項',
   '以鹽命名的攤子：草藥被一個老傷兵分類|灰布校門：小屋裡有一處提供治療的台|銅盆上的水沫：牧醫總在日落前換水|沒有墓誌的歇腳石：下面擱著乾乾淨淨的紗布|暖壁碎碗：倉房人用碗藏進一袋配方',
   '墨汁還在重寫：紙上的字等你決定要去哪一行|猜想的爐渣：鑄匠請你鑑定不可能出現的材質|被讀過兩遍的詛咒：巫術板想換另一個答案|室內下起碎鐵：窗外的吊船正拋下過重的行李|從夢裡送來的勳章：老士兵不知道它屬於哪場戰爭'
  ],
  yan:[
   '烽燧殘灰：灰燼只在背風的一側積得整齊|驛道里程碑：碑背刻著繞開工事的小路|半截風箏：線軸的方向指向乾燥的田埂|牆上的墨魚：墨跡流向唯一沒積水的巷口|天師的符紙：符角折起，指著安全的渡口',
   '倀物房的木箱：箱底還留著柳兒標記的零件|田邊的農具架：鋤柄裡藏了一卷銅線|翻倒的茶擔：青瓷茶器下壓著乾糧|皮影戲箱：戲偶背面縫了小袋|鏢局寄存櫃：鎖頭鏽了，封條卻是新的',
   '戲台上的空鑼：敲一下，整條街的器倀都安靜下來|界園的半行詩：補上下半行，夢境便退開一步|祠堂長明燈：添一勺油，墨魎不再靠近|老農的節氣歌：照著唱，田裡的病氣散了些|司歲台的晨鐘：鐘聲過後，夢境重新分出遠近',
   '茶樓的欠帳：掌櫃願付錢買回遺失的帳本|鏢局的懸紅：護送一段路就能領到酬金|書坊的雕版：坊主重金收購未刻完的字模|集市的秤：替商販校正一桿秤，對方以銅錢答謝|驛站的公文：替驛丞補齊印信，他付了跑腿錢',
   '藥鋪的後院：老郎中把曬好的草藥分給傷員|溫泉旁的涼亭：熱氣讓僵硬的傷口緩過來|酒肆的灶房：一碗熱粥和乾淨的紗布|天師府的偏殿：學徒留下一張安神符|漁家的船篷：船娘用竹筒煎好了藥湯',
   '畫中游魚：魚從卷軸游出，吐出一個寫著方位的泡泡|自己下棋的棋盤：黑白子在等你落下最後一手|十二時辰的鈴：只有一個時辰的鈴聲不屬於今天|不會乾的墨：寫下的字隔天換了意思|岸邊的老者：他說三日前你也來過這裡'
  ]
 };
 const regionalCatalog=Object.fromEntries(Object.entries(regionalScenes).map(([region,groups])=>[region,groups.flatMap((group,profile)=>
  group.split('|').map((scene,index)=>{
   const [title,body]=scene.split('：');
   return {id:'encounter121:'+region+':'+(profile*5+index+1),region,title,body,profile,index};
  }))]));
 const regionalEvents=Object.fromEntries(Object.values(regionalCatalog).flat().map(event=>[event.id,event]));
 const escapeEvent=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function drawEncounter(r){
  const pool=regionalCatalog[r.expedition.regionId];
  if(!pool||!r.story.encounters121)return null;
  const seen=r.story.encounterSeen121??=[];
  const available=pool.filter(x=>!seen.includes(x.id));
  if(!available.length)return null;
  const selected=pick(available);seen.push(selected.id);
  return {type:'frontierEvent',id:selected.id,roll:rnd(100),claimed:false};
 }
 const localApproaches={
  chernobog:['核對舊市政路標','拆下可用零件','借隔離設備去污','按舊城紀錄結算','借用臨時醫療點','追查工業設備的異常'],
  lungmen:['核對封路通告','清點寄存貨物','避開巡查隊','和街坊結清謝金','請志工照護傷員','接下街坊的委託'],
  siesta:['描出避灰步道','回收隔熱零件','停在背風處降溫','領取海濱委託酬勞','到涼棚處理傷口','查看未登記的訊號'],
  sargon:['辨認背風的商道','起出埋在沙下的工具','利用遮蔽補水','向商隊交付紀錄','在驛站為傷員整備','順著反常的指標走'],
  kazimierz:['從場務路線離開','清點賽場備件','請場務撤下曝光','向場方結清款項','借用賽場醫療設備','確認傳聞背後的證物'],
  kjerag:['沿雪線記下路標','挖出保暖設備備件','停下來避風取暖','替驛站核對帳務','把傷員帶進暖室','查看雪線回聲來源'],
  siracusa:['確認內巷出口','核對寄存物件','請街坊代為交涉','把憑據送到街坊手上','請店家照看傷員','回應陌生接頭人'],
  columbia:['依檢修圖標記出口','領用回收組件','停止干擾源','申請現場回收補貼','使用廠內急救設施','重啟異常設備'],
  victoria:['確認撤離交通線','收拾撤離部隊留下的備件','協助整理後方防線','領取運輸協助款','在救護點重新包紮','回應頻道上的舊口令'],
  iberia:['用潮痕標記退路','整理海堤旁的備件','依潮務員指示整備航路','交付港口紀錄','在頂風處穩定傷勢','查看海邊的異常證物'],
  sami:['用雪線校對讀數','檢查落在雪中的設備','依本地人的方式校準訊號','領取勘察工作酬勞','在背風處休整傷員','回答未曾聽過的訊號'],
  kazdel:['把刻痕抄進地圖','拾取鑄匠遺留的材料','用靜默儀式平息殘響','收回寄放的報酬','請牧醫協助整隊','與說書人交換另一種答案'],
  yan:['依烽燧殘灰辨認退路','翻找倀物房的舊零件','用晨鐘與節氣歌平復歲夢','替鏢局結清酬金','請郎中照看傷員','回應畫中游魚的提問']
 };
 function regionalOptions(event,r=R()){
  const choice=(id,name,text,cost=0,disabled=false)=>({id,name,text,cost,disabled});
  const field=FrontierEnvironment.current(),name=FrontierEnvironment.definitions[field?.region]?.name||'地區環境';
  const credits=6+event.index;
  const wealth=choice('cred','記錄所見並領取謝金','源石碇 +'+credits);
  const scout=choice('survey','循線校對方向','勘探點數 +1',0,!r.survey16||r.survey16.surveyIndex>=6);
  const calm=choice('relief','沿安全做法處理','緩解'+name);
  const heal=choice('heal','分出一段時間照護','存活幹員恢復 8% 最大生命值');
  const curio=choice('curio','仔細檢查留下的物件','支付 6 源石碇，從三件戰術奇物中選一件',6,!r.curios);
  const surveyGain=Math.max(0,Math.min(2,6-(r.survey16?.surveyIndex??6)));
  const options=[
   [scout,wealth],
   [choice('material','收下實用零件','取得 2 份普通加工素材'),curio],
   [calm,choice('trade','轉交紀錄但繼續趕路','源石碇 +'+(credits+3)+'，增加地區負擔')],
   [wealth,choice('paidSurvey','付費取得完整路書','支付 5 源石碇，勘探點數 +'+surveyGain,5,!surveyGain)],
   [heal,choice('supply','帶走應急補給','取得 1 份戰術補給，須留意背包空間')],
   [choice('gamble','接受對方的提議','或能發現一件戰術奇物，也可能空手而歸、加重地區負擔',0,!r.curios),event.index%2?wealth:scout]
  ][event.profile];
  options[0]={...options[0],name:localApproaches[event.region][event.profile]};
  if(FrontierEnvironment.needsRelief()&&!options.some(x=>x.id==='relief'))options.push(calm);
  return options;
 }
 function chooseRegional(id){
  const r=R(),e=r?.event,d=regionalEvents[e?.id];
  if(!d||e.claimed)return;
  if(id==='leave'){select(false);return;}
  const option=regionalOptions(d).find(x=>x.id===id);
  if(!option||option.disabled||r.fieldPoints<option.cost)return;
  r.fieldPoints-=option.cost;
  const reward=(item,qty)=>{r.field.materials[item]=(r.field.materials[item]||0)+qty;};
  const key='encounter:'+r.number+':'+e.id;
  let outcome=option.text;
  switch(id){
   case 'cred':r.fieldPoints+=6+d.index;break;
   case 'trade':r.fieldPoints+=9+d.index;FrontierEnvironment.pressure();break;
   case 'survey':case 'paidSurvey':FrontierSurvey16.gain(id==='survey'?1:2,d.title,key);break;
   case 'relief':FrontierEnvironment.treat();break;
   case 'heal':for(const a of r.team)if(a.hp>0)a.hp=Math.min(a.max,a.hp+FrontierEnvironment.healing(Math.ceil(a.max*.08)));break;
   case 'supply':reward(['med_aid_t3','med_shield_t3','med_neural_t3','med_antidote_t3','med_stamina_t3'][d.index],1);break;
   case 'material':reward(FrontierProgress.materialId(['iron','device','rock','ketone','sugar'][d.index],2),2);break;
   case 'curio':case 'gamble':
    if(id==='gamble'&&e.roll>=60){FrontierEnvironment.pressure();outcome='未得到收藏品，地區負擔增加';}
    else{FrontierCurios.offer(key);outcome='找到收藏品線索';}
    break;
  }
  e.claimed=true;
  note(d.id,d.title+'：'+outcome,{choice:id});
  FrontierGrid.sync();FrontierCombat.sync();toast('PRTS｜'+outcome);
  if(r.curios?.offers?.length){save();render();return;}
  completeNode();
 }
 function resolveRegional(item){
  const r=R(),e=r?.event;
  if(!e?.claimed||!regionalEvents[e.id])return;
  const key='encounter:'+r.number+':'+e.id,o=r.curios?.offers?.find(x=>x.key===key);
  if(o){
   if(item==='skip')FrontierCurios.decline(key);
   else if(o.ids.includes(item))FrontierCurios.claim(key,item);
   else return;
  }
  if(!r.curios?.offers?.some(x=>x.key===key))completeNode();
 }
 function renderRegional(r,e,d){
  if(e.claimed){
   const o=r.curios?.offers?.find(x=>x.key==='encounter:'+r.number+':'+e.id);
   const choices=o?o.ids.map(id=>'<button data-curio="'+id+'" onclick="FrontierAdventure.resolveRegional(\''+id+'\')">'+FrontierCurios.icon(id)+'<b>'+escapeEvent(FrontierCurioData.forRun(R())[id].name)+'</b><small>'+escapeEvent(FrontierCurioData.forRun(R())[id].effect)+'</small></button>').join(''):'';
   $('#app').innerHTML=runHeader()+'<section class="panel event-panel regional-encounter121"><small>不期而遇</small><h2>'+escapeEvent(d.title)+'</h2><div>'+choices+'<button onclick="FrontierAdventure.resolveRegional(\'skip\')">'+(o?'放棄奇物':'繼續前進')+'</button></div></section>';
   return;
  }
  const controls=regionalOptions(d,r).map(option=>'<button '+(option.disabled||r.fieldPoints<option.cost?'disabled ':'')+'onclick="FrontierAdventure.chooseRegional(\''+option.id+'\')"><b>'+option.name+'</b><small>'+escapeEvent(option.text)+'</small></button>').join('');
  $('#app').innerHTML=runHeader()+'<section class="panel event-panel regional-encounter121"><small>不期而遇</small><h2>'+escapeEvent(d.title)+'</h2><p>'+escapeEvent(d.body)+(/[。！？]$/.test(d.body)?'':'。')+'</p><div>'+controls+'<button onclick="FrontierAdventure.chooseRegional(\'leave\')">啟程離開</button></div></section>'+bagHtml();
 }
 const relics={thermal_core:{id:'thermal_core',name:'穩定熱源核心',text:'本局寒冷累積每兩次減免一次，開啟雪境隱藏結局線索。'},relay_key:{id:'relay_key',name:'中繼站通行訊標',text:'本局完成中繼修復後，可從第四層安全節點特殊撤離。'},barricade:{id:'barricade',name:'便攜路障',text:'下一場全隊開場各3盾，使用後耗盡。'}};
 cards.story_burden={name:'殘響負擔',owner:'common',cost:1,kind:'draw',draw:0,exhaust:true,text:'沒有正面效果。消耗。'};
 const thresholds=[0,6,18,36,60,90];
 function ensure(){db.exploration??={version:1,regions:{},discoveries:{},endings:{},relicArchive:{}};for(const r of FrontierExpedition.regions)db.exploration.regions[r.id]??={exp:0,level:0};return db.exploration}
 function story(){return R()?.story}
 function gain(n){if(!R()?.expedition||R().contract?.mode==='simulation')return;const s=ensure().regions[R().expedition.regionId];s.exp+=n;s.level=thresholds.filter(v=>s.exp>=v).length-1}
 function note(id,text,details={}){const s=story(),r=R(),e=r?.expedition;if(!s||!e)return;s.log.push({id,region:e.regionId,layer:e.layer+1,depth:r.depth,at:Date.now(),text,choice:details.choice||'record',flags:structuredClone(s.flags),importantItems:[...s.relics],mapEffects:{specialExit:!!s.flags.specialExit,node:e.current||null,lane:e.lastLane},hiddenEnding:s.ending==='hidden',hiddenEndingInvolved:!!s.flags.device||s.ending==='hidden'});if(s.log.length>80)s.log.shift();const key=R().expedition.regionId+':'+id;if(!ensure().discoveries[key]&&R().depth>=1){db.exploration.discoveries[key]=Date.now();gain(2)}}
 function giveRelic(id){const s=story();if(!s.relics.includes(id))s.relics.push(id);ensure().relicArchive[id]??=Date.now();note('relic:'+id,'取得劇情道具：'+relics[id].name)}
 function setNode(layer,row,event){const e=R().expedition;for(const node of (e.graphVersion>=2?e.layers[layer]?.rows[row]?.slice(0,1):e.layers[layer]?.rows[row])||[]){node.type='event';node.risk=0;node.hidden=false;node.storyEvent=event}}
 const oldStart=startRun;startRun=function(){const previous=R();oldStart();const r=R();if(!r?.environment||r===previous)return;ensure();r.story={version:1,encounters121:true,flags:{device:0,relay:0},relics:[],log:[],escort:null,ending:'normal',settled:false};if(r.expedition.mode==='standard'){setNode(0,1,'chain_device');setNode(1,0,'chain_relay');setNode(1,2,'chain_analyze');setNode(2,0,'chain_route');setNode(2,1,'chain_decode');setNode(2,2,'escort');setNode(3,0,'chain_repair');setNode(3,1,'chain_core');setNode(4,r.expedition.layers[4].rows.length-2,'ending');const goal=r.expedition.layers[3].rows[Math.floor(r.expedition.layers[3].rows.length/2)];goal.forEach(n=>n.escortGoal=true)}const level=db.exploration.regions[r.expedition.regionId].level;if(level>=1)r.scoutLevel=Math.max(1,r.scoutLevel||0);save();render()};
 const oldEnter=FrontierExpedition.enterNode;FrontierExpedition.enterNode=function(id){const e=R()?.expedition,n=e?.layers[e.layer].rows[e.row]?.find(n=>n.id===id);if(!n||!FrontierExpedition.available(n))return;oldEnter(id);if(!story()||n.type!=='event'||R().battle)return;const s=story(),pool=[...general.filter(([id])=>!eventRegions[id]||eventRegions[id]===e.regionId),...(e.regionId==='kjerag'?snow:[])],local=pool.find(([id])=>eventRegions[id]===e.regionId&&!s.log.some(entry=>entry.id===id)),regional=!n.storyEvent&&drawEncounter(R());R().event=regional||{type:'frontierEvent',id:n.storyEvent||(local||pick(pool))[0],claimed:false};save();render()};
 function chainDescription(id){const f=story().flags;return({chain_device:['雪下的未知裝置','檢查裝置，開始跨層研究','保留殘片（純劇情，不佔免費物資空間）'],chain_analyze:['第二層：研究員的請求',f.device===1?'支付8源石碇 分析殘片':'沒有取得殘片，仍可正常前進','分析'],chain_decode:['第三層：訊號解碼',f.device===2?'將分析結果拼成隱藏路線':'缺少前置分析，可放棄調查','解碼'],chain_core:['第四層：核心的所在',f.device===3?'研究完成，取得本局熱源核心':'沒有完整線索，核心保持封存','啟動熱源'],chain_relay:['失效的中繼站','拾取斷線地圖，準備跨層修復','接受修復任務'],chain_route:['第三層：中繼路由',f.relay===1?'支付6源石碇 取得修復路由':'沒有中繼圖，略過此任務','取得路由'],chain_repair:['第四層：最後一段電纜',f.relay===2?'支付10源石碇 修復，解鎖本層條件撤離':'缺少路由資料，不能修復','修復中繼'],escort:['受困的研究員','護送至第四層中段安全營地；NPC至少70%HP可開特殊撤離。普通攻擊前有預告，可消耗共用能量保護或治療。','接受護送'],ending:['第五層：命運所指',R().expedition.regionId==='kjerag'&&f.device===4?'熱源核心發出另一個訊號，可自願挑戰隱藏首領；普通結局仍可選。':'沿標準路線進入最後首領。','選擇隱藏路線']})[id]}
 function availableChain(id){const f=story().flags;return id==='chain_device'||id==='chain_relay'||id==='chain_analyze'&&f.device===1&&R().fieldPoints>=8||id==='chain_decode'&&f.device===2||id==='chain_core'&&f.device===3||id==='chain_route'&&f.relay===1&&R().fieldPoints>=6||id==='chain_repair'&&f.relay===2&&R().fieldPoints>=10||id==='escort'&&!story().escort&&R().expedition.layers[3]?.rows.some(row=>row.some(n=>n.escortGoal))||id==='ending'&&R().expedition.regionId==='kjerag'&&f.device===4}
 function select(accept){const r=R(),e=r?.event,s=story();if(!s||e?.type!=='frontierEvent'||e.claimed)return;const id=e.id,d=events[id],chain=chainDescription(id);if(regionalEvents[id]&&accept)return;if(accept&&chain&&!availableChain(id))return;if(accept&&d&&!apply(d))return;if(!accept&&id==='battlefield'&&r.environment?.region==='victoria'&&r.environment.rulesVersion>=2){r.environment.front=Math.max(-2,r.environment.front-1);e.frontRetreat=r.environment.front}if(!accept&&id==='broken_bridge')FrontierEnvironment.forceMove('斷橋繞行');e.claimed=true;if(accept&&chain){if(id==='chain_device')s.flags.device=1;if(id==='chain_analyze'){r.fieldPoints-=8;s.flags.device=2}if(id==='chain_decode'){s.flags.device=3;r.scoutLevel=Math.max(4,r.scoutLevel||0)}if(id==='chain_core'){s.flags.device=4;giveRelic('thermal_core');gain(3)}if(id==='chain_relay')s.flags.relay=1;if(id==='chain_route'){r.fieldPoints-=6;s.flags.relay=2}if(id==='chain_repair'){r.fieldPoints-=10;s.flags.relay=3;s.flags.specialExit=true;giveRelic('relay_key');gain(3)}if(id==='escort')s.escort={id:'researcher',name:'隨隊研究員',hp:240,max:240,block:0,status:'traveling',usedTurn:0};if(id==='ending')s.ending='hidden'}note(id,(chain?.[0]||d?.title||regionalEvents[id]?.title||id)+'：'+(accept?'接受／執行':'放棄，沿主路前進')+(e.frontRetreat!=null?'；戰線後退至'+e.frontRetreat:''),{choice:accept?'accept':'decline'});completeNode()}
 function apply(d){const r=R(),env=FrontierEnvironment.current(),cost=['research','scout','heal','paidSupply'].includes(d.effect)?d.value:0;if(r.fieldPoints<cost){toast('源石碇 不足。');return false}if(d.effect==='medicine'&&!(r.field.materials.med_aid_t3>0)){toast('需要1份戰地急救包。');return false}r.fieldPoints-=cost;switch(d.effect){case'material':case'mine':r.field.materials[FrontierProgress.materialId(d.family,2)]=(r.field.materials[FrontierProgress.materialId(d.family,2)]||0)+d.value;if(d.effect==='mine')FrontierEnvironment.adjust(1,'高風險開採');break;case'research':r.field.materials.mat_device_t3=(r.field.materials.mat_device_t3||0)+2;break;case'medicine':r.field.materials.med_aid_t3--;r.intel+=4;break;case'scout':r.scoutLevel=Math.max(3,r.scoutLevel||0);break;case'negotiate':if(env?.region==='lungmen')FrontierEnvironment.adjust(-2,'交涉');else if(env?.region==='siracusa'){env.trust=Math.min(5,env.trust+1);env.hostility=Math.max(0,env.hostility-1)}else r.fieldPoints+=4;break;case'cleanse':FrontierEnvironment.treat();break;case'intel':r.intel+=d.value;break;case'barrier':giveRelic('barricade');break;case'heal':r.team.filter(a=>a.hp>0).forEach(a=>a.hp=Math.min(a.max,a.hp+60));FrontierCombat.sync();break;case'paidSupply':case'supplies':r.field.materials.med_aid_t3=(r.field.materials.med_aid_t3||0)+1;break;case'sponsor':r.fieldPoints+=d.value;if(env?.region==='kazimierz')FrontierEnvironment.adjust(1,'公開贊助');else r.alarm+=2;break;case'family':if(env?.region==='siracusa'){env.trust=Math.min(5,env.trust+2);env.hostility=Math.min(5,env.hostility+1)}else r.intel+=2;break;case'repair':r.intel+=2;break;case'front':if(env?.region==='victoria')env.front=Math.min(2,env.front+1);r.field.materials.mat_iron_t2=(r.field.materials.mat_iron_t2||0)+3;break;case'lighthouse':if(env?.region==='iberia')FrontierEnvironment.treat();r.team.forEach(a=>{if(a.status)a.status.neural=0});break;case'anomaly':r.intel+=3;if(env?.region==='sami')FrontierEnvironment.adjust(1,'研究異常');break;case'pact':r.deck.push({id:'story_burden',up:false});safeflag();break}return true}
 function safeflag(){story().flags.pact=true;if(R().environment?.region==='kazdel')FrontierEnvironment.adjust(1,'自願簽訂殘響契約')}
 function attackBonus(){const b=R()?.battle;if(!b||FrontierEnvironment.current()?.region!=='kazdel'||R().operatorSystemVersion===113||!story()?.flags.pact||b.storyPactTurn===b.turn)return 0;b.storyPactTurn=b.turn;return 2}
 function npcAction(action){const r=R(),n=story()?.escort,b=r?.battle,key=r?.number+':'+r?.depth+':'+r?.expedition?.current;if(!['shield','heal'].includes(action)||!n||n.status!=='traveling'||n.hp<=0||!b||b.energy<1||n.usedTurn===b.turn&&(n.usedBattle==null||n.usedBattle===key))return;b.energy--;n.usedTurn=b.turn;n.usedBattle=key;if(action==='shield')n.block+=60;else if(action==='heal')n.hp=Math.min(n.max,n.hp+40);else return;save();render()}
 function npcPanel(){const n=story()?.escort;if(!n)return'';return `<section class="panel npc-panel"><h3>${n.name} · ${n.status==='traveling'?'護送中':n.status==='success'?'護送完成':n.status==='partial'?'已抵達，未達70%':'任務失敗'}</h3><p>HP ${n.hp}/${n.max} · 護盾 ${n.block} · 目的地：第四層中段營地</p>${R().battle&&n.status==='traveling'?'<button onclick="FrontierAdventure.npcAction(\'shield\')">保護NPC · 1能量／60盾</button><button onclick="FrontierAdventure.npcAction(\'heal\')">治療NPC · 1能量／40HP</button><p class="tiny muted">每回合二選一；與幹員共用能量。</p>':''}</section>`}
 function prepareBattle(){const r=R(),b=r?.battle,s=story();if(b&&s){if(!b.storyReady){b.storyReady=true;if(s.escort?.status==='traveling'){s.escort.usedTurn=0;s.escort.usedBattle=r.number+':'+r.depth+':'+r.expedition.current;}if(s.relics.includes('barricade')){r.team.filter(a=>a.hp>0).forEach(a=>a.block+=30);s.relics=s.relics.filter(id=>id!=='barricade')}if(s.ending==='hidden'&&b.type==='boss'&&!b.enemies[0].regionRoster){b.enemies[0].name='冰封中繼核心';b.enemies[0].block+=60;b.hiddenCore=true}}b.enemies.forEach(e=>e.npcTarget=false);if(s.escort?.status==='traveling'&&b.turn%2===0){const e=b.enemies.filter(e=>e.hp>0).at(-1);if(e){e.npcTarget=true;e.intent='attack'}}}}
 const oldBattle=battleView;battleView=function(){prepareBattle();const s=story();oldBattle();if(s)$('#app').insertAdjacentHTML('beforeend',npcPanel())};
 const oldIntent=intentText;intentText=function(e){return e.npcTarget?'攻擊護送NPC '+e.atk+'傷':oldIntent(e)};
 const oldTurn=endTurn;endTurn=function(){const r=R(),b=r?.battle,n=story()?.escort,attack=b?.enemies.find(e=>e.hp>0&&e.npcTarget);if(n?.status==='traveling'&&attack){const damage=Math.max(0,attack.atk-n.block);n.block=Math.max(0,n.block-attack.atk);n.hp=Math.max(0,n.hp-damage);attack.intent='defend';if(!n.hp){n.status='failed';note('escort_failed','研究員倒下，護送失敗；遠征仍可繼續。')}}if(b?.hiddenCore){const e=b.enemies.find(e=>e.hp>0);if(e)e.block+=40}return oldTurn()};
 const oldComplete=completeNode;completeNode=function(){const r=R(),e=r?.expedition,node=e?.layers[e.layer].rows[e.row]?.find(n=>n.id===e.current),n=story()?.escort;if(node?.escortGoal&&n?.status==='traveling'){n.status=n.hp>=Math.ceil(n.max*.7)?'success':'partial';if(n.status==='success'){story().flags.specialExit=true;r.fieldPoints+=n.hp===n.max?25:15;gain(3)}note('escort_arrived','護送抵達：'+n.hp+'/'+n.max+'HP，'+(n.status==='success'?'完成條件，解鎖特殊撤離。':'未達70%，取得部分情報。'));r.intel+=2}return oldComplete()};
 function specialExit(){const r=R();if(!story()?.flags.specialExit||r.expedition.layer!==3||r.battle||r.event||r.reward||r.result)return;note('special_exit','經已修復中繼／護送安全通道撤離');endRun('extract')}
 function logView(log=story()?.log||[]){return '<section class="panel"><h3>遠征事件日誌</h3>'+log.map(x=>{const region=FrontierExpedition.regions.find(r=>r.id===x.region)?.name,items=(x.importantItems||[]).map(id=>relics[id]?.name||id),flags=x.flags?Object.entries(x.flags).filter(([,v])=>v).map(([k,v])=>({device:'裝置調查',relay:'中繼修復',specialExit:'特殊撤離'}[k]||k)+':'+v):[];return '<article class="event-log-entry"><p class="tiny">'+(region?esc(region)+' · ':'')+'第'+x.layer+'層 · '+esc(x.text)+'</p>'+(Number.isFinite(x.at)?'<p class="tiny muted">'+esc(new Date(x.at).toLocaleString('zh-TW',{hour12:false}))+'</p>':'')+(items.length?'<p class="tiny">重要物品：'+(x.importantItems||[]).map(id=>window.FrontierIcons?.html(id)||'').join('')+esc(items.join('、'))+'</p>':'')+(flags.length?'<p class="tiny muted">'+esc(flags.join(' · '))+'</p>':'')+(x.mapEffects?.specialExit?'<p class="tiny">已開啟第四層特殊撤離路線</p>':'')+(x.hiddenEndingInvolved?'<p class="tiny muted">與雪境隱藏結局線索相關</p>':'')+'</article>'}).join('')+'</section>'}
 const oldEvent=eventView;eventView=function(){const e=R()?.event;if(e?.type!=='frontierEvent')return oldEvent();const entry=regionalEvents[e.id];if(entry)return renderRegional(R(),e,entry);const d=events[e.id],c=chainDescription(e.id);$('#app').innerHTML=runHeader()+`<section class="panel"><div class="eyebrow">ENCOUNTER / 不期而遇</div><h1>${c?.[0]||d?.title}</h1><p>${c?.[1]||d?.choice}</p>${e.id==='battlefield'&&R().environment?.region==='victoria'&&R().environment.rulesVersion>=2?'<p class="tiny weather">放棄支援會讓戰線後退1（最低-2）；退卻時敵方先鋒攻擊+1，支援或營地整備可回復。</p>':''}<button class="primary" ${c&&!availableChain(e.id)?'disabled':''} onclick="FrontierAdventure.select(true)">${c?.[2]||'執行此選擇'}</button><button onclick="FrontierAdventure.select(false)">保持原路，離開</button><p class="tiny muted">物資仍需裝入背包；所有結果與選擇會保存，重新整理不會重抽。</p></section>`+npcPanel()+logView()};
 const oldRoute=routeView;routeView=function(){oldRoute();if(story())$('#app').innerHTML+=npcPanel()+(story().flags.specialExit&&R().expedition.layer===3?'<button class="primary" onclick="FrontierAdventure.specialExit()">使用已解鎖的特殊撤離通道</button>':'')+logView()};
 const oldCheck=checkBattle;checkBattle=function(){const b=R()?.battle;if(story()&&b?.type==='boss'&&R().hp>0&&b.enemies.every(e=>e.hp<=0)&&!b.exploreFirst){b.exploreFirst=true;const key=R().expedition.regionId+':boss';if(!ensure().discoveries[key]){db.exploration.discoveries[key]=Date.now();gain(3)}}return oldCheck()};
 function completedEndings(r){
  const e=r.expedition;if(e?.extension&&e.layer>=5)return [e.fifthEnding,...(e.extension.paths||[e.extension.path]).slice(0,e.layer-4)];
  return [window.FrontierEndings?.bossPath(r,4)||r.story?.ending||'normal'];
 }
 const oldEnd=endRun;endRun=function(result,index){
  const r=R();if(!r||r.result)return;
  // 高危探索不紀錄通關結局。
  const highRisk=r.expedition?.mode==='highrisk';
  const s=story(),endings=result==='win'&&!highRisk?completedEndings(r):[];
  if(s&&!s.settled&&r.contract?.mode!=='simulation'&&r.depth>=3){
   s.settled=true;gain(['extract','win'].includes(result)?3:1);
   for(const ending of endings){
    const branch=window.FrontierEndings?.definitions[r.expedition.regionId]?.[ending],key=r.expedition.regionId+':'+ending;
    ensure().endings[key]??={at:Date.now(),run:r.number};
    note('ending:'+ending,branch?'完成'+FrontierEndings.labels[ending]+'：'+branch.boss+'。'+FrontierEndings.epilogue(r,ending):ending==='hidden'?'完成隱藏結局：雪線之外的回聲':'完成一結局：平安歸航');
   }
  }
  oldEnd(result,index);
  const record=db.statistics?.raids.find(x=>x.number===r.number);
  if(record&&s){record.events=structuredClone(s.log);record.ending=highRisk?null:endings.at(-1)||s.ending;if(endings.length)record.endings=endings;record.escort=structuredClone(s.escort)}
  save();
 };
 const oldFinish=finishView;finishView=function(){
  oldFinish();const r=R();if(!story())return;
  if(r?.result==='win'&&window.FrontierEndings)for(const ending of completedEndings(r)){
   const label=FrontierEndings.labels[ending];if(label)$('#app').insertAdjacentHTML('beforeend','<p class="weather">'+esc(label+'｜'+FrontierEndings.epilogue(r,ending))+'</p>');
  }
  $('#app').innerHTML+=logView();
 };
 const oldDetail=FrontierStatistics.detail;FrontierStatistics.detail=function(number){oldDetail(number);const row=db.statistics.raids.find(r=>r.number===number);if(row?.events)(document.querySelector('#modal .screen-simple-dialog,#modal .modal-box,#modal .modal-content')||document.querySelector('#modal'))?.insertAdjacentHTML('beforeend',logView(row.events))};
 const oldPrepare=prepare;prepare=function(){oldPrepare();const select=document.querySelector('#exp-region');if(select){const box=document.createElement('p');box.className='tiny muted';const update=()=>{const s=ensure().regions[select.value];box.textContent='地區探索 Lv.'+s.level+' · '+s.exp+'EXP；下級門檻 '+(thresholds[s.level+1]||'已滿級')};select.after(box);update();select.addEventListener('change',update)}};
 const oldValid=validSave;validSave=function(v){const ev=v.run?.event;let copy=ev?.type==='frontierEvent'?{...v,run:{...v.run,event:null}}:v;if(!oldValid(copy))return false;if(ev?.type==='frontierEvent'&&(!events[ev.id]&&!regionalEvents[ev.id]&&!['chain_device','chain_analyze','chain_decode','chain_core','chain_relay','chain_route','chain_repair','escort','ending'].includes(ev.id)||typeof ev.claimed!=='boolean'))return false;if(regionalEvents[ev?.id]&&(regionalEvents[ev.id].region!==v.run.expedition?.regionId||!Number.isInteger(ev.roll)||ev.roll<0||ev.roll>=100))return false;const s=v.run?.story,p=v.exploration;return(!p||p.version===1&&FrontierExpedition.regions.every(r=>Number.isInteger(p.regions[r.id]?.exp)&&p.regions[r.id].exp>=0&&p.regions[r.id].level===thresholds.filter(n=>p.regions[r.id].exp>=n).length-1))&&(!s||s.version===1&&Array.isArray(s.relics)&&s.relics.every(id=>relics[id])&&Array.isArray(s.log)&&s.log.length<=80&&['normal','hidden'].includes(s.ending)&&(!s.escort||s.escort.hp>=0&&s.escort.hp<=s.escort.max&&[24,240].includes(s.escort.max)&&['traveling','success','partial','failed'].includes(s.escort.status)))};
 ensure();return{registerRegional143(entry){if(regionalEvents[entry.id]||events[entry.id]||!regionalCatalog[entry.region])throw Error("Invalid regional event "+entry.id);regionalEvents[entry.id]=entry;regionalCatalog[entry.region].push(entry)},events,regionalCatalog,regionalOptions,chooseRegional,resolveRegional,general,snow,relics,thresholds,ensure,story,gain,note,giveRelic,select,apply,attackBonus,npcAction,npcPanel,prepareBattle,specialExit,logView};
})();
