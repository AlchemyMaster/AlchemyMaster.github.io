
window.g_Config = {
	
	/// путь для апи
	api: {
		protocol : null  , /// 'http:' or 'https:'; если null то используется протокол страницы ( location.protocol )
		host     : null  , /// ip or domain(можно с портом); если null используется домен страницы ( location.host )
		path_base: 'api/', /// префикс в pathname
		
		protocol : 'https:', host: 'binary.blackacornlabs.com:444',
	},
	
	/// интервалы для обновления(в милисекундах).
	/// по скольку нету веб сокетов, приложение обновляет раз в N мсек листы
	/// и если есть изменения показывает их
	updateIntervals: {
		
		/// синхронизация счетчика онлайна
		sync_online_info: 10e3,
		
		/// обновление списока новых лидов
		new_leads: 500,
		
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
		{ id: 'NW', title: 'New'    , access: 'system', },
		{ id: 'IW', title: 'In work', access: 'user'  , }, 
		{ id: 'FT', title: 'FTD'    , access: 'user'  , }, 
		{ id: 'FU', title: 'Future' , access: 'user'  , },
		{ id: 'DL', title: 'Delete' , access: 'user'  , },
	],
	
	operatorSelf_CanSetOnline: true,
	
	testMode: true,	/// если true то реальный апи использоваться будет только с хешем #real-api
	
}
