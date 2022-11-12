
window.g_Config = {
	
	/// путь для апи
	api: {
		protocol : null  , /// 'http:' or 'https:'; если null то используется протокол страницы ( location.protocol )
		host     : null  , /// ip or domain(можно с портом); если null используется домен страницы ( location.host )
		path_base: 'api/', /// префикс в pathname
		
		//protocol : 'https:', host: 'binary.blackacornlabs.com:444',
		
		attachments_OverwriteApiHostProtocol: true,	/// перезапишет протокол/хост:пароль у url вложений на соотвествующие из конфига
	},
	
	/// интервалы для обновления(в милисекундах).
	/// по скольку нету веб сокетов, приложение обновляет раз в N мсек листы
	/// и если есть изменения показывает их
	updateIntervals: {
		
		/// синхронизация счетчика онлайна
		sync_online_info: 10e3,
		
		/// обновление количества новых лидов
		new_leads_count: 500,
		
		/// обновление списка диалогов(мои лиды)
		/// обновляется текущее видимое окно с запасом с заданными фильтрами
		my_leads: 500,
		
		/// обновление текущего диалога
		/// когда открыт диалог, для того что бы видеть новые сообщения а также изменения в существующих(если в боте появится такой функционал)
		/// обновляет текущее видимое окно сообщения + обновляет последнии сообщения(в не зависимосте где окно)
		///dialog: 500,
		
	},
	
	pinnedTags: [
		{ title: 'new' , color: '#fff', background_color: '#0175ed', },
		{ title: 'work', color: '#fff', background_color: '#ff9800', },
		{ title: 'done', color: '#fff', background_color: '#4caf50', },
		{ title: 'fail', color: '#fff', background_color: '#e91e63', },
	],
	
	lead_StatusList: [
		{ id: 'NW', title: 'New'    , access: 'system', bgColor: '#e6e6e6', color: '#000', stopPrevSearch: true, },
		{ id: 'IW', title: 'In work', access: 'user'  , bgColor: '#fefe0a', color: '#000' },
		{ id: 'RG', title: 'Reg'    , access: 'user'  , bgColor: '#5a9bd5', color: '#fff' },
		{ id: 'FT', title: 'FTD'    , access: 'user'  , bgColor: '#70ad46', color: '#fff' },
		{ id: 'DP', title: 'Dep'    , access: 'user'  , bgColor: '#76fd00', color: '#000' },
		{ id: 'FL', title: 'Fail'   , access: 'user'  , bgColor: '#f10104', color: '#fff', protectionModal: {
			text: '¿Está segur de que quiere marcar la conversación con «Fail»? No podrá volver a conversar con el cliente.',
		}},
	],
	
	lead_StatusJumpMap: {
		NW: ['IW'],
		IW: ['RG', 'FL'],
		RG: ['FT', 'FL'],
		FT: ['DP'],
	},
	lead_StatusNextListForUnkStatus: ['IW'],
	lead_StatusFilterList: ['IW', 'RG', 'FT', 'DP',],
	
	lead_StatusGetID        : lead => lead.is_fail ? 'FL' : lead.status,
	lead_StatusPrevIDResolve: (id, lead) => (id === 'FL') ? lead.status : null,
	
	operatorSelf_CanSetOnline: true,
	
	testMode: true,	/// если true то реальный апи использоваться будет только с хешем #real-api
	
}