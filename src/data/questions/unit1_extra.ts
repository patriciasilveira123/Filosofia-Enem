import { Question } from '../../types/quiz';

export const UNIT1_EXTRA_QUESTIONS: Question[] = [
  {
    "id": 43,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência para quê?",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "A ciência não é apenas um conjunto de fórmulas abstratas guardadas em laboratórios. Ela responde à necessidade humana de compreender os fenômenos naturais, prever acontecimentos e desenvolver tecnologias que melhorem as condições de vida, embora seus usos dependam de escolhas éticas e políticas.",
    "source": "Elaboração didática sobre Filosofia da Ciência.",
    "command": "O texto destaca que a finalidade da atividade científica envolve",
    "alternatives": [
      {
        "key": "A",
        "text": "neutralidade absoluta, livre de qualquer impacto social.",
        "comment": "Incorreta. O texto ressalta que os usos da ciência dependem de escolhas éticas e políticas."
      },
      {
        "key": "B",
        "text": "compreensão da realidade e aplicação prática orientada por valores.",
        "comment": "Correta. A ciência busca explicar o mundo e transformá-lo, exigindo responsabilidade ética em suas aplicações."
      },
      {
        "key": "C",
        "text": "exclusão do debate público sobre os rumos da tecnologia.",
        "comment": "Incorreta. Se depende de escolhas políticas, o debate público é essencial."
      },
      {
        "key": "D",
        "text": "repetição de dogmas religiosos sem comprovação empírica.",
        "comment": "Incorreta. A ciência baseia-se em investigação e evidências, não em dogmas."
      },
      {
        "key": "E",
        "text": "busca exclusiva por lucro comercial acima da vida humana.",
        "comment": "Incorreta. O texto aponta a melhoria das condições de vida e a necessidade de ética."
      }
    ],
    "correct": "B"
  },
  {
    "id": 44,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência moderna",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“A filosofia está escrita neste grandíssimo livro que continuamente está aberto diante dos nossos olhos (quero dizer, o universo), mas que não se pode entender se antes não se aprende a entender a língua e a conhecer os caracteres em que está escrito. Ele está escrito em língua matemática.”",
    "source": "GALILEI, G. O Ensaiador. São Paulo: Nova Cultural, 1996, p. 46.",
    "command": "A ruptura promovida pela ciência moderna caracterizou-se pela",
    "alternatives": [
      {
        "key": "A",
        "text": "valorização exclusiva da contemplação passiva sem experimentos.",
        "comment": "Incorreta. A experimentação ativa é pilar da ciência moderna."
      },
      {
        "key": "B",
        "text": "adoção do método experimental aliado à linguagem matemática.",
        "comment": "Correta. Galileu e a Revolução Científica consolidaram a união entre experimento e matemática."
      },
      {
        "key": "C",
        "text": "subordinação das leis físicas às interpretações teológicas.",
        "comment": "Incorreta. A ciência moderna buscou autonomia em relação à teologia."
      },
      {
        "key": "D",
        "text": "rejeição de instrumentos de medição como o telescópio.",
        "comment": "Incorreta. Galileu aprimorou e utilizou o telescópio para observações astronômicas."
      },
      {
        "key": "E",
        "text": "explicação dos movimentos pela busca de \"lugares naturais\".",
        "comment": "Incorreta. A teoria dos lugares naturais pertence à física aristotélica, superada por Galileu."
      }
    ],
    "correct": "B"
  },
  {
    "id": 45,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Epistemologias contemporâneas",
    "difficulty": "Difícil",
    "triWeight": 2.2,
    "baseText": "“Não exigirei que um sistema científico seja suscetível de ser dado como válido, de uma vez por todas, em sentido positivo; exigirei, porém, que sua forma lógica seja tal que se torne possível validá-lo através de recurso a provas empíricas, em sentido negativo: deve ser possível refutar, pela experiência, um sistema científico empírico.”",
    "source": "POPPER, K. A Lógica da Pesquisa Científica. São Paulo: Cultrix, 2007, p. 42.",
    "command": "O critério de demarcação científica proposto por Popper é denominado",
    "alternatives": [
      {
        "key": "A",
        "text": "verificacionismo absoluto, baseado na confirmação definitiva.",
        "comment": "Incorreta. Popper critica o verificacionismo indutivista."
      },
      {
        "key": "B",
        "text": "falseabilidade, pois a ciência avança pela possibilidade de refutação.",
        "comment": "Correta. Para Popper, o critério da ciência é a falseabilidade (ou refutabilidade): hipóteses devem ser testáveis e passíveis de erro."
      },
      {
        "key": "C",
        "text": "dogmatismo metodológico, que impede a revisão de teorias.",
        "comment": "Incorreta. Popper defende a revisão constante das teorias."
      },
      {
        "key": "D",
        "text": "relativismo epistêmico, no qual qualquer opinião equivale à ciência.",
        "comment": "Incorreta. Popper estabelece um critério rigoroso para distinguir ciência de não-ciência."
      },
      {
        "key": "E",
        "text": "indutivismo ingênuo, que garante verdades eternas pela observação.",
        "comment": "Incorreta. Popper rejeita a indução como fundamento lógico da ciência."
      }
    ],
    "correct": "B"
  },
  {
    "id": 46,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Epistemologias contemporâneas",
    "difficulty": "Difícil",
    "triWeight": 2.2,
    "baseText": "“As revoluções científicas são aqui consideradas aqueles episódios de desenvolvimento não-cumulativo, nos quais um paradigma mais antigo é total ou parcialmente substituído por um novo, incompatível com o anterior.”",
    "source": "KUHN, T. A Estrutura das Revoluções Científicas. São Paulo: Perspectiva, 2006, p. 125.",
    "command": "Na perspectiva de Thomas Kuhn, uma revolução científica ocorre quando",
    "alternatives": [
      {
        "key": "A",
        "text": "o paradigma vigente acumula anomalias que não consegue mais explicar.",
        "comment": "Correta. As anomalias geram crise no paradigma dominante, levando à substituição por um novo modelo explicativo."
      },
      {
        "key": "B",
        "text": "os cientistas abandonam toda forma de pesquisa coletiva.",
        "comment": "Incorreta. A ciência normal e as revoluções ocorrem no interior de comunidades científicas."
      },
      {
        "key": "C",
        "text": "o conhecimento anterior é apenas somado sem nenhuma ruptura.",
        "comment": "Incorreta. Kuhn critica exatamente a visão puramente acumulativa e linear."
      },
      {
        "key": "D",
        "text": "a matemática deixa de ser utilizada nas ciências naturais.",
        "comment": "Incorreta. Não há abandono da matemática, mas mudança de paradigma."
      },
      {
        "key": "E",
        "text": "o Estado proíbe a publicação de novos experimentos.",
        "comment": "Incorreta. Trata-se de uma dinâmica interna e histórica da comunidade científica."
      }
    ],
    "correct": "A"
  },
  {
    "id": 47,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Mudanças climáticas",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "O consenso científico internacional aponta que o aquecimento global acelerado desde a Revolução Industrial tem origem antropogênica, isto é, decorre principalmente da queima de combustíveis fósseis e do desmatamento. Negar essas evidências compromete políticas de mitigação essenciais.",
    "source": "Adaptado de relatórios do IPCC e debates em Filosofia da Ciência.",
    "command": "A relação entre ciência e sociedade diante das mudanças climáticas evidencia a importância de",
    "alternatives": [
      {
        "key": "A",
        "text": "ignorar dados empíricos em favor de interesses econômicos imediatos.",
        "comment": "Incorreta. Isso agrava a crise climática."
      },
      {
        "key": "B",
        "text": "fundamentar decisões públicas em evidências científicas consolidadas.",
        "comment": "Correta. O conhecimento científico fornece a base confiável para políticas ambientais responsáveis."
      },
      {
        "key": "C",
        "text": "substituir pesquisas climáticas por opiniões individuais nas redes.",
        "comment": "Incorreta. Opiniões sem método não substituem o consenso científico."
      },
      {
        "key": "D",
        "text": "interromper toda pesquisa tecnológica sobre energias limpas.",
        "comment": "Incorreta. A ciência e a tecnologia são aliadas na transição energética."
      },
      {
        "key": "E",
        "text": "tratar o clima como fenômeno imutável sem relação com a ação humana.",
        "comment": "Incorreta. O texto destaca a origem antropogênica do aquecimento atual."
      }
    ],
    "correct": "B"
  },
  {
    "id": 48,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência e sociedade",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "Durante pandemias, o financiamento público à pesquisa básica permite o desenvolvimento rápido de vacinas e tratamentos. Contudo, a circulação de desinformação científica pode reduzir a adesão da população às medidas de saúde coletiva.",
    "source": "Elaboração didática sobre divulgação científica.",
    "command": "Para fortalecer a relação democrática entre ciência e sociedade, torna-se fundamental",
    "alternatives": [
      {
        "key": "A",
        "text": "restringir o acesso ao conhecimento científico apenas aos laboratórios.",
        "comment": "Incorreta. O isolamento dificulta a compreensão pública da ciência."
      },
      {
        "key": "B",
        "text": "promover a alfabetização científica e a transparência na comunicação.",
        "comment": "Correta. A educação e a divulgação científica combatem a desinformação e fortalecem a cidadania."
      },
      {
        "key": "C",
        "text": "eliminar a revisão por pares para acelerar boatos.",
        "comment": "Incorreta. A revisão por pares é garantia de rigor científico."
      },
      {
        "key": "D",
        "text": "submeter os resultados laboratoriais à votação popular.",
        "comment": "Incorreta. A validade científica depende de método e evidências, não de plebiscito."
      },
      {
        "key": "E",
        "text": "privatizar integralmente todas as universidades públicas.",
        "comment": "Incorreta. O texto destaca a importância do financiamento público à pesquisa."
      }
    ],
    "correct": "B"
  },
  {
    "id": 49,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência contemporânea",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "A física do século XX, com a teoria da relatividade e a mecânica quântica, mostrou que o determinismo rígido da física clássica possui limites. No nível subatômico, as previsões assumem caráter probabilístico, e o próprio observador interfere no sistema observado.",
    "source": "Elaboração didática sobre Ciência Contemporânea.",
    "command": "Essas descobertas da ciência contemporânea transformaram a visão epistemológica ao indicar que",
    "alternatives": [
      {
        "key": "A",
        "text": "o conhecimento científico é provisório e aberto a revisões conceituais.",
        "comment": "Correta. A ciência contemporânea reconhece os limites dos modelos clássicos e o caráter histórico e revisável das teorias."
      },
      {
        "key": "B",
        "text": "a razão humana é incapaz de formular qualquer lei física.",
        "comment": "Incorreta. A física quântica e a relatividade possuem altíssimo rigor matemático."
      },
      {
        "key": "C",
        "text": "a tecnologia moderna dispensou completamente o uso da física.",
        "comment": "Incorreta. Toda a eletrônica atual depende da mecânica quântica."
      },
      {
        "key": "D",
        "text": "o universo funciona de modo idêntico ao modelo mecânico de Newton em todas as escalas.",
        "comment": "Incorreta. O texto mostra justamente os limites do modelo clássico em escalas subatômicas e relativísticas."
      },
      {
        "key": "E",
        "text": "a ciência voltou a utilizar explicações mitológicas.",
        "comment": "Incorreta. A probabilidade quântica é matemática, não mitológica."
      }
    ],
    "correct": "A"
  },
  {
    "id": 50,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência moderna",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“Ciência e poder do homem coincidem, uma vez que, sendo a causa ignorada, frustra-se o efeito. Pois a natureza não se vence, senão quando se lhe obedece.”",
    "source": "BACON, F. Novum Organum. São Paulo: Nova Cultural, 1999, Aforismo III, p. 33.",
    "command": "A frase \"saber é poder\", no pensamento de Francis Bacon, expressa uma concepção de ciência voltada para",
    "alternatives": [
      {
        "key": "A",
        "text": "a submissão da natureza aos interesses práticos e técnicos da humanidade.",
        "comment": "Correta. Bacon inaugura a visão pragmática e experimental da ciência moderna como instrumento de intervenção no mundo."
      },
      {
        "key": "B",
        "text": "a defesa do poder absoluto dos reis acima da razão.",
        "comment": "Incorreta. O poder referido por Bacon é o poder técnico sobre a natureza."
      },
      {
        "key": "C",
        "text": "a rejeição de qualquer experimento prático em laboratório.",
        "comment": "Incorreta. Bacon é um dos principais teóricos do método experimental."
      },
      {
        "key": "D",
        "text": "a valorização da retórica escolástica medieval.",
        "comment": "Incorreta. Bacon critica os \"ídolos\" e a estagnação escolástica."
      },
      {
        "key": "E",
        "text": "a proibição do uso de máquinas na produção humana.",
        "comment": "Incorreta. Bacon incentivava o progresso técnico."
      }
    ],
    "correct": "A"
  },
  {
    "id": 51,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Mudanças climáticas",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "A transição para matrizes energéticas renováveis enfrenta não apenas desafios técnicos, mas também disputas geopolíticas e econômicas. Países em desenvolvimento reivindicam justiça climática, argumentando que as nações historicamente mais industrializadas emitiram a maior parte dos gases de efeito estufa.",
    "source": "Elaboração didática sobre Ciência, Política e Clima.",
    "command": "O conceito de justiça climática mencionado no texto relaciona a crise ambiental à necessidade de",
    "alternatives": [
      {
        "key": "A",
        "text": "responsabilidade diferenciada entre países conforme seu histórico de emissões.",
        "comment": "Correta. Justiça climática reconhece que os impactos e as responsabilidades históricas são desiguais entre nações."
      },
      {
        "key": "B",
        "text": "proibição do desenvolvimento industrial nos países pobres.",
        "comment": "Incorreta. A justiça climática busca transição justa, não punição aos mais pobres."
      },
      {
        "key": "C",
        "text": "manutenção do uso irrestrito de carvão mineral.",
        "comment": "Incorreta. Isso agravaria o aquecimento global."
      },
      {
        "key": "D",
        "text": "desconsideração dos acordos internacionais sobre o clima.",
        "comment": "Incorreta. Acordos multilaterais são instrumentos centrais dessa pauta."
      },
      {
        "key": "E",
        "text": "transferência dos custos ambientais exclusivamente às populações vulneráveis.",
        "comment": "Incorreta. A justiça climática busca justamente proteger os mais vulneráveis."
      }
    ],
    "correct": "A"
  },
  {
    "id": 52,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência e sociedade",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "Embora a ciência busque objetividade metodológica, as agendas de pesquisa — o que se decide investigar e financiar — são frequentemente influenciadas por prioridades políticas, militares ou de mercado.",
    "source": "Elaboração didática sobre Sociologia e Filosofia da Ciência.",
    "command": "Essa constatação leva à conclusão de que a prática científica",
    "alternatives": [
      {
        "key": "A",
        "text": "ocorre em um vácuo social totalmente isolado da história.",
        "comment": "Incorreta. A ciência é uma prática humana inserida na sociedade."
      },
      {
        "key": "B",
        "text": "está inserida em contextos sociais que orientam seus investimentos e aplicações.",
        "comment": "Correta. Reconhecer os condicionantes sociais da ciência não nega seu método, mas amplia a compreensão crítica sobre ela."
      },
      {
        "key": "C",
        "text": "deve ser abandonada por não possuir nenhuma objetividade.",
        "comment": "Incorreta. A objetividade metodológica continua sendo um ideal regulador importante."
      },
      {
        "key": "D",
        "text": "é idêntica à propaganda ideológica sem critérios de teste.",
        "comment": "Incorreta. A ciência possui critérios próprios de validação."
      },
      {
        "key": "E",
        "text": "nunca produziu benefícios reais para a saúde humana.",
        "comment": "Incorreta. Os avanços médicos e sanitários são evidentes."
      }
    ],
    "correct": "B"
  },
  {
    "id": 53,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Epistemologias contemporâneas",
    "difficulty": "Difícil",
    "triWeight": 2.2,
    "baseText": "Gaston Bachelard afirmou que o conhecimento científico progride mediante a superação de \"obstáculos epistemológicos\", como as impressões primeiras, os preconceitos do senso comum e o apego a imagens familiares que impedem a formulação de conceitos abstratos.",
    "source": "Adaptado de BACHELARD, G. A Formação do Espírito Científico.",
    "command": "De acordo com Bachelard, a formação do espírito científico exige",
    "alternatives": [
      {
        "key": "A",
        "text": "a confirmação imediata das aparências cotidianas.",
        "comment": "Incorreta. As aparências imediatas são frequentemente obstáculos epistemológicos."
      },
      {
        "key": "B",
        "text": "a ruptura crítica com o senso comum e os hábitos mentais imediatos.",
        "comment": "Correta. Para Bachelard, a ciência constrói-se contra a opinião imediata, exigindo retificação constante."
      },
      {
        "key": "C",
        "text": "o abandono da abstração matemática nas ciências.",
        "comment": "Incorreta. Bachelard valoriza a abstração científica."
      },
      {
        "key": "D",
        "text": "a aceitação acrítica da tradição oral.",
        "comment": "Incorreta. A tradição não examinada pode atuar como obstáculo."
      },
      {
        "key": "E",
        "text": "a eliminação de toda pergunta que gere dúvida.",
        "comment": "Incorreta. Para Bachelard, todo conhecimento é resposta a uma pergunta."
      }
    ],
    "correct": "B"
  },
  {
    "id": 54,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência para quê?",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "A tecnologia biomédica atual permite editar genes e prolongar a expectativa de vida. No entanto, filósofos da bioética alertam que nem tudo o que é tecnicamente possível é eticamente desejável.",
    "source": "Elaboração didática sobre Bioética e Ciência.",
    "command": "O alerta apresentado no texto aponta para a necessidade de",
    "alternatives": [
      {
        "key": "A",
        "text": "submeter a inovação científica a princípios éticos de dignidade humana.",
        "comment": "Correta. A bioética estabelece limites e critérios morais para o uso das biotecnologias."
      },
      {
        "key": "B",
        "text": "proibir qualquer pesquisa médica em universidades.",
        "comment": "Incorreta. Não se trata de proibir a ciência, mas de orientá-la eticamente."
      },
      {
        "key": "C",
        "text": "reduzir a medicina apenas a critérios de lucratividade.",
        "comment": "Incorreta. A bioética combate a mercantilização da vida."
      },
      {
        "key": "D",
        "text": "negar os avanços da genética no tratamento de doenças.",
        "comment": "Incorreta. Os benefícios terapêuticos são reconhecidos quando eticamente conduzidos."
      },
      {
        "key": "E",
        "text": "deixar decisões clínicas exclusivamente a algoritmos sem supervisão.",
        "comment": "Incorreta. A responsabilidade ética é humana."
      }
    ],
    "correct": "A"
  },
  {
    "id": 55,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência moderna",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "A passagem do geocentrismo para o heliocentrismo, defendida por Copérnico e confirmada por observações de Galileu, retirou a Terra do centro do universo e provocou profunda crise cultural na Europa moderna.",
    "source": "Elaboração didática sobre a Revolução Científica.",
    "command": "O impacto filosófico da revolução copernicana consistiu em",
    "alternatives": [
      {
        "key": "A",
        "text": "reforçar a ideia de que o ser humano é o centro físico do cosmos.",
        "comment": "Incorreta. O heliocentrismo descentrou a Terra e o ser humano."
      },
      {
        "key": "B",
        "text": "demonstrar que o conhecimento científico pode desafiar visões tradicionais.",
        "comment": "Correta. A nova astronomia mostrou a autonomia da investigação científica frente a dogmas estabelecidos."
      },
      {
        "key": "C",
        "text": "comprovar que os sentidos humanos nunca se enganam.",
        "comment": "Incorreta. A olho nu parece que o Sol gira em torno da Terra; a ciência corrigiu essa aparência."
      },
      {
        "key": "D",
        "text": "impedir o desenvolvimento da física newtoniana.",
        "comment": "Incorreta. Copérnico e Galileu prepararam o caminho para Newton."
      },
      {
        "key": "E",
        "text": "unificar todas as religiões europeias sob um único dogma.",
        "comment": "Incorreta. Não houve tal unificação religiosa."
      }
    ],
    "correct": "B"
  },
  {
    "id": 56,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência contemporânea",
    "difficulty": "Difícil",
    "triWeight": 2.2,
    "baseText": "Boaventura de Sousa Santos propõe uma \"ecologia de saberes\", criticando a monocultura do saber científico ocidental quando esta desqualifica conhecimentos tradicionais, indígenas e populares que também oferecem respostas válidas para a relação sustentável com a natureza.",
    "source": "Adaptado de SANTOS, B. S. Para além do pensamento abissal.",
    "command": "A proposta da ecologia de saberes defende",
    "alternatives": [
      {
        "key": "A",
        "text": "a destruição completa da ciência moderna.",
        "comment": "Incorreta. Não se trata de destruir a ciência, mas de dialogar com outros saberes."
      },
      {
        "key": "B",
        "text": "o diálogo horizontal entre a ciência e diferentes formas de conhecimento.",
        "comment": "Correta. A ecologia de saberes reconhece a pluralidade epistemológica sem hierarquias excludentes."
      },
      {
        "key": "C",
        "text": "a superioridade absoluta da técnica industrial sobre culturas locais.",
        "comment": "Incorreta. O autor critica exatamente essa monocultura."
      },
      {
        "key": "D",
        "text": "o isolamento das comunidades tradicionais sem acesso à saúde.",
        "comment": "Incorreta. O diálogo visa integrar benefícios mútuos."
      },
      {
        "key": "E",
        "text": "a substituição das universidades por mitologias antigas.",
        "comment": "Incorreta. Trata-se de ampliar a universidade, não de fechá-la."
      }
    ],
    "correct": "B"
  },
  {
    "id": 57,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Mudanças climáticas",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "O negacionismo climático frequentemente utiliza estratégias retóricas para criar a falsa impressão de que não há consenso científico sobre o aquecimento global, atrasando medidas urgentes de redução de emissões.",
    "source": "Elaboração didática sobre Epistemologia e Clima.",
    "command": "Do ponto de vista filosófico e científico, o enfrentamento do negacionismo climático requer",
    "alternatives": [
      {
        "key": "A",
        "text": "dar o mesmo peso epistêmico a opiniões infundadas e a estudos revisados por pares.",
        "comment": "Incorreta. Isso cria falsa equivalência."
      },
      {
        "key": "B",
        "text": "distinguir o ceticismo científico legítimo da negação ideológica de evidências.",
        "comment": "Correta. A ciência é cética por método, mas reconhece evidências robustas; o negacionismo ignora dados consolidados."
      },
      {
        "key": "C",
        "text": "proibir o debate científico nas universidades.",
        "comment": "Incorreta. O debate científico rigoroso é saudável."
      },
      {
        "key": "D",
        "text": "abandonar qualquer monitoramento ambiental por satélite.",
        "comment": "Incorreta. O monitoramento é essencial para os dados."
      },
      {
        "key": "E",
        "text": "esperar que o problema se resolva espontaneamente sem ação humana.",
        "comment": "Incorreta. A inércia agrava os danos."
      }
    ],
    "correct": "B"
  },
  {
    "id": 58,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência moderna",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "“O livro da natureza foi escrito em caracteres matemáticos; seus caracteres são triângulos, círculos e outras figuras geométricas, sem as quais é humanamente impossível compreender uma só palavra.”",
    "source": "GALILEI, G. O Ensaiador. Coleção Os Pensadores. São Paulo: Nova Cultural, 1996, p. 119.",
    "command": "A célebre declaração de Galileu Galilei estabelece como marco fundamental da Revolução Científica moderna a",
    "alternatives": [
      {
        "key": "A",
        "text": "permanência das noções qualitativas e teleológicas da física aristotélica.",
        "comment": "Incorreta. Galileu rompe com a física teleológica aristotélica em favor da quantificação."
      },
      {
        "key": "B",
        "text": "dependência das investigações empíricas em relação aos textos bíblicos.",
        "comment": "Incorreta. Galileu defendeu a autonomia da investigação científica em relação às Escrituras."
      },
      {
        "key": "C",
        "text": "matematização dos fenômenos físicos como critério rigoroso de inteligibilidade da natureza.",
        "comment": "Correta. A ciência moderna nasce da fusão entre observação sistemática e modelagem matemática das leis físicas."
      },
      {
        "key": "D",
        "text": "rejeição de qualquer instrumento de observação mecânica do céu e da terra.",
        "comment": "Incorreta. Galileu foi pioneiro no uso do telescópio para observações astronômicas sistemáticas."
      },
      {
        "key": "E",
        "text": "concepção de que a natureza opera por simpatias e analogias herméticas.",
        "comment": "Incorreta. Isso pertencia à magia renascentista, que a física mecanicista galileana superou."
      }
    ],
    "correct": "C"
  },
  {
    "id": 59,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência moderna",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“Quatro são os gêneros de ídolos que bloqueiam a mente humana: os ídolos da tribo, os da caverna, os do foro e os do teatro. Para penetrar no reino da ciência é preciso purgá-los completamente.”",
    "source": "BACON, F. Novum Organum. Aforismo XXXIX. São Paulo: Abril Cultural, 1979, p. 33.",
    "command": "Na teoria baconiana, a superação dos \"ídolos da mente\" tem por objetivo precípuo",
    "alternatives": [
      {
        "key": "A",
        "text": "eliminar os preconceitos que distorcem a observação e fundar um método indutivo experimental rigoroso.",
        "comment": "Correta. Bacon elabora a crítica aos ídolos para desobstruir o intelecto humano de falsas noções e inaugurar a indução empírica metódica."
      },
      {
        "key": "B",
        "text": "restaurar a autoridade incontestável da dialética medieval sobre as ciências naturais.",
        "comment": "Incorreta. Bacon critica ferozmente o silogismo escolástico estéril."
      },
      {
        "key": "C",
        "text": "provar que a imaginação poética é a única ferramenta capaz de desvendar a matéria.",
        "comment": "Incorreta. A imaginação descontrolada faz parte dos ídolos que iludem a mente."
      },
      {
        "key": "D",
        "text": "desencorajar as aplicações técnicas e o domínio prático do meio ambiente.",
        "comment": "Incorreta. O lema baconiano é \"saber é poder\": a ciência visa intervir na natureza em benefício da humanidade."
      },
      {
        "key": "E",
        "text": "consolidar a metafísica platônica como fundamento de todos os saberes.",
        "comment": "Incorreta. Bacon combate o verbalismo especulativo sem experimentação."
      }
    ],
    "correct": "A"
  },
  {
    "id": 60,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Epistemologias contemporâneas",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "“Um sistema científico não deve ser julgado segundo o critério de sua confirmação irrestrita, mas segundo a possibilidade de ser refutado pela experiência. Chamo falseabilidade a esse critério de demarcação.”",
    "source": "POPPER, K. A Lógica da Pesquisa Científica. São Paulo: Cultrix, 2007, p. 42.",
    "command": "De acordo com Karl Popper, o critério que distingue a ciência autêntica dos saberes pseudocientíficos é a",
    "alternatives": [
      {
        "key": "A",
        "text": "capacidade de acumular provas definitivas que tornem uma hipótese imune a críticas.",
        "comment": "Incorreta. Para Popper, nenhuma teoria pode ser provada em definitivo; a busca por confirmação cega é típica da pseudociência."
      },
      {
        "key": "B",
        "text": "suscetibilidade da teoria de ser testada e refutada por dados empíricos potencialmente contrários.",
        "comment": "Correta. O falseacionismo de Popper estabelece que uma teoria só é científica se fizer previsões arriscadas passíveis de teste empírico e refutação."
      },
      {
        "key": "C",
        "text": "aprovação unânime das proposições pelos líderes da comunidade religiosa.",
        "comment": "Incorreta. Critérios teológicos não demarcam a ciência."
      },
      {
        "key": "D",
        "text": "ausência de qualquer hipótese arriscada na construção dos modelos teóricos.",
        "comment": "Incorreta. Popper defende que a ciência avança mediante \"conjecturas audaciosas e refutações severas\"."
      },
      {
        "key": "E",
        "text": "identificação absoluta entre o discurso científico e o discurso mitológico.",
        "comment": "Incorreta. Popper busca justamente demarcar o conhecimento científico empírico do não-científico."
      }
    ],
    "correct": "B"
  },
  {
    "id": 61,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Epistemologias contemporâneas",
    "difficulty": "Difícil",
    "triWeight": 2.2,
    "baseText": "“O sucesso de um paradigma é no início em grande parte uma promessa de sucesso perceptível em exemplos selecionados e ainda incompletos. A ciência normal consiste na realização dessa promessa, alargando o conhecimento daqueles fatos que o paradigma indica como particularmente reveladores.”",
    "source": "KUHN, T. A Estrutura das Revoluções Científicas. São Paulo: Perspectiva, 2006, p. 44.",
    "command": "Na perspectiva kuhniana, a atividade de \"ciência normal\" caracteriza-se pelo",
    "alternatives": [
      {
        "key": "A",
        "text": "questionamento radical diário de todos os fundamentos teóricos vigentes no laboratório.",
        "comment": "Incorreta. O questionamento radical só ocorre durante os períodos de crise extraordinária e revolução, não na ciência normal."
      },
      {
        "key": "B",
        "text": "abandono permanente de qualquer consenso em favor do anarquismo metodológico irrestrito.",
        "comment": "Incorreta. Isso descreve o anarquismo de Feyerabend, não a ciência normal de Kuhn."
      },
      {
        "key": "C",
        "text": "recurso exclusivo ao raciocínio dedutivo sem qualquer experimento com a matéria.",
        "comment": "Incorreta. A ciência normal resolve quebra-cabeças empíricos e teóricos práticos."
      },
      {
        "key": "D",
        "text": "trabalho de resolução de quebra-cabeças no interior das regras estabelecidas pelo paradigma aceito.",
        "comment": "Correta. Na ciência normal, os cientistas compartilham um paradigma comum e trabalham para solucionar problemas específicos dentro do modelo."
      },
      {
        "key": "E",
        "text": "desaparecimento das instituições acadêmicas e dos periódicos especializados.",
        "comment": "Incorreta. As instituições e periódicos são os principais veículos da socialização paradigmática."
      }
    ],
    "correct": "D"
  },
  {
    "id": 62,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Epistemologias contemporâneas",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“Não há nenhuma regra, por mais plausível que seja e por mais firmemente fundada que esteja na epistemologia, que não seja violada em uma ou outra ocasião. Tais violações não são acontecimentos acidentais [...]. São, pelo contrário, necessárias para o progresso.”",
    "source": "FEYERABEND, P. Contra o Método. Rio de Janeiro: Francisco Alves, 1977, p. 33.",
    "command": "A tese central de Paul Feyerabend, conhecida como anarquismo epistemológico, sustenta que",
    "alternatives": [
      {
        "key": "A",
        "text": "o método cartesiano de quatro passos é o único caminho seguro para a física.",
        "comment": "Incorreta. Feyerabend nega que qualquer método único e fixo possa dar conta do avanço da ciência."
      },
      {
        "key": "B",
        "text": "os cientistas devem se subordinar rigorosamente a normas burocráticas estatais.",
        "comment": "Incorreta. Feyerabend defende a liberdade metodológica radical e o lema \"tudo vale\" (anything goes)."
      },
      {
        "key": "C",
        "text": "a fixação em um método universal único esteriliza a criatividade e bloqueia descobertas revolucionárias.",
        "comment": "Correta. Feyerabend argumenta historicamente que grandes avanços científicos (como Galileu) ocorreram pela transgressão de regras consagradas."
      },
      {
        "key": "D",
        "text": "a astrologia e a física quântica operam com os mesmos padrões de teste empírico.",
        "comment": "Incorreta. Feyerabend problematiza o monopólio epistemológico, mas seu foco é a pluralidade da prática científica histórica."
      },
      {
        "key": "E",
        "text": "a ciência moderna nunca alcançou qualquer resultado útil para a humanidade.",
        "comment": "Incorreta. Feyerabend não nega as realizações técnicas, mas combate o dogmatismo e a arrogância metodológica."
      }
    ],
    "correct": "C"
  },
  {
    "id": 63,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência contemporânea",
    "difficulty": "Difícil",
    "triWeight": 2.2,
    "baseText": "“O espírito científico deve formar-se contra a natureza, contra o que é em nós e fora de nós o impulso e a informação da natureza, contra o arrebatamento natural, contra o fato colorido e variado. O espírito científico deve formar-se reformando-se.”",
    "source": "BACHELARD, G. A Formação do Espírito Científico. Rio de Janeiro: Contraponto, 1996, p. 29.",
    "command": "A epistemologia histórica de Gaston Bachelard concebe o avanço do conhecimento científico como um processo de",
    "alternatives": [
      {
        "key": "A",
        "text": "acumulação contínua e pacífica de observações sensoriais imediatas.",
        "comment": "Incorreta. A ciência progride por rupturas e retificações, superando obstáculos epistemológicos."
      },
      {
        "key": "B",
        "text": "superação crítica de obstáculos epistemológicos e ruptura com o saber imediato e o senso comum.",
        "comment": "Correta. Para Bachelard, a ciência é polêmica e construtiva; progride desconstruindo intuições primeiras e ilusões empíricas cotidianas."
      },
      {
        "key": "C",
        "text": "retorno saudosista às concepções cosmológicas dos poetas gregos arcaicos.",
        "comment": "Incorreta. Bachelard valoriza a física contemporânea não-newtoniana e a química moderna."
      },
      {
        "key": "D",
        "text": "reconciliação mística entre as paixões humanas e as leis da termodinâmica.",
        "comment": "Incorreta. A formação científica exige vigilância intelectual contra projeções afetivas ingênuas."
      },
      {
        "key": "E",
        "text": "substituição definitiva do pensamento abstrato pela mera intuição estética.",
        "comment": "Incorreta. A ciência bachelardiana opera pelo racionalismo aplicado e pela abstração rigorosa."
      }
    ],
    "correct": "B"
  },
  {
    "id": 64,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência para quê?",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "“A ciência sem consciência não é mais que a ruína da alma, pois a técnica desprovida de limites éticos transforma os poderes criadores do engenho humano em instrumentos mortíferos de destruição em massa.”",
    "source": "RABELAIS, François. Pantagruel. In: MORIN, Edgar. Ciência com Consciência. Rio de Janeiro: Bertrand Brasil, 2005, p. 19.",
    "command": "O aforismo clássico retomado pelo sociólogo Edgar Morin adverte os pesquisadores contemporâneos quanto à necessidade de",
    "alternatives": [
      {
        "key": "A",
        "text": "paralisar de modo definitivo qualquer tipo de pesquisa nas áreas da medicina e da biotecnologia.",
        "comment": "Incorreta. A crítica ética não defende a extinção da ciência, mas a sua reflexividade ética."
      },
      {
        "key": "B",
        "text": "subordinar os laboratórios científicos exclusivamente aos interesses de lucro das multinacionais.",
        "comment": "Incorreta. A mercantilização cega da técnica é um dos problemas que degradam a responsabilidade social."
      },
      {
        "key": "C",
        "text": "desprezar o saber acumulado pelos cientistas modernos em prol do obscurantismo medieval.",
        "comment": "Incorreta. O texto conclama à responsabilidade crítica, não ao obscurantismo."
      },
      {
        "key": "D",
        "text": "separar totalmente o desenvolvimento tecnológico de qualquer debate sobre cidadania e direitos.",
        "comment": "Incorreta. Trata-se do oposto: articular conhecimento científico com reflexão humanista e ética."
      },
      {
        "key": "E",
        "text": "vincular a produção do conhecimento tecnocientífico à reflexão ética e ao compromisso com a vida.",
        "comment": "Correta. A \"ciência com consciência\" exige que os impactos sociais, ecológicos e humanos da tecnociência sejam orientados pela ética e responsabilidade."
      }
    ],
    "correct": "E"
  },
  {
    "id": 65,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência e sociedade",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“Os fatos científicos não são descobertos em um vazio social como maçãs colhidas de uma árvore; eles são construídos no laboratório através de redes complexas que mobilizam instrumentos, verbas, textos, aliados políticos e controvérsias.”",
    "source": "LATOUR, B. Ciência em Ação: como seguir cientistas e engenheiros sociedade afora. São Paulo: Editora Unesp, 2000, p. 48.",
    "command": "Ao propor a análise da ciência \"em ação\", o sociólogo Bruno Latour evidencia que",
    "alternatives": [
      {
        "key": "A",
        "text": "a produção da verdade científica envolve práticas sociais, materiais e disputas institucionais concretas.",
        "comment": "Correta. A teoria ator-rede de Latour demonstra que os enunciados científicos se tornam fatos sólidos mediante a construção de redes sociotécnicas e alianças de validação."
      },
      {
        "key": "B",
        "text": "os experimentos de laboratório são fraudes conspiratórias desprovidas de qualquer eficácia empírica.",
        "comment": "Incorreta. Latour não nega a realidade dos fatos nem a eficácia técnica, mas estuda o processo real de sua fabricação e estabilização."
      },
      {
        "key": "C",
        "text": "o trabalho de pesquisa depende exclusivamente da genialidade isolada de mentes solitárias.",
        "comment": "Incorreta. Latour desconstrói o mito do gênio isolado, mostrando o caráter coletivo e reticular da pesquisa."
      },
      {
        "key": "D",
        "text": "a política governamental nada tem a ver com o financiamento e a validação das ciências.",
        "comment": "Incorreta. As redes científicas dependem intimamente de apoio estatal, financiamento e regulação."
      },
      {
        "key": "E",
        "text": "a verdade científica decorre de uma revelação metafísica concedida apenas aos filósofos.",
        "comment": "Incorreta. Os fatos são construídos por controvérsias laboratoriais e instrumentos práticos."
      }
    ],
    "correct": "A"
  },
  {
    "id": 66,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Mudanças climáticas",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "“O aquecimento global antropogênico não é uma hipótese teórica remota; é uma constatação corroborada pelo consenso esmagador de milhares de climatologistas ao redor do globo. Ignorar os dados é escolher o desastre ecológico planejado.”",
    "source": "IPCC. Relatório de Avaliação do Clima: síntese para formuladores de políticas. Genebra: Nações Unidas, 2021, p. 14.",
    "command": "Diante do consenso científico internacional sobre o clima, o negacionismo contemporâneo expressa",
    "alternatives": [
      {
        "key": "A",
        "text": "o ápice do rigor metodológico e da prudência lógica preconizados por Descartes.",
        "comment": "Incorreta. A dúvida cartesiana busca alicerces firmes; o negacionismo rejeita evidências sólidas por conveniência ideológica."
      },
      {
        "key": "B",
        "text": "uma atitude de desprendimento ecológico inspirada nas tradições monásticas orientais.",
        "comment": "Incorreta. O negacionismo apoia a exploração predatória dos combustíveis fósseis."
      },
      {
        "key": "C",
        "text": "uma revolução paradigmática revolucionária liderada por cientistas independentes.",
        "comment": "Incorreta. Não se trata de nova ciência, mas de recusa política de consensos empíricos amplamente testados."
      },
      {
        "key": "D",
        "text": "a rejeição deliberada de evidências empíricas consolidadas em favor de interesses econômicos e ideológicos.",
        "comment": "Correta. O negacionismo climático contrapõe narrativas sem lastro científico ao trabalho empírico acumulado pelas ciências atmosféricas."
      },
      {
        "key": "E",
        "text": "a demonstração cabal de que a atmosfera terrestre é imune às emissões industriais de carbono.",
        "comment": "Incorreta. As medições atestam a elevação recorde da concentração de gases de efeito estufa."
      }
    ],
    "correct": "D"
  },
  {
    "id": 67,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência moderna",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“O mecanicismo moderno concebeu a natureza como uma gigantesca máquina de relógio: matéria em movimento regida por forças universais que podem ser expressas em equações matemáticas precisas e reproduzíveis.”",
    "source": "KOYRÉ, A. Do Mundo Fechado ao Universo Infinito. Rio de Janeiro: Forense Universitária, 2006, p. 15.",
    "command": "A metáfora do mundo como \"máquina de relógio\" sintetiza o paradigma newtoniano-cartesiano caracterizado pelo",
    "alternatives": [
      {
        "key": "A",
        "text": "animismo primitivo, que enxerga alma e intenção consciente nas pedras e ventos.",
        "comment": "Incorreta. O mecanicismo elimina completamente o animismo da física."
      },
      {
        "key": "B",
        "text": "vitalismo biológico, que recusa qualquer descrição matemática dos corpos em repouso.",
        "comment": "Incorreta. O mecanicismo quantifica a matéria e reduz os corpos a extensão mensurável (res extensa)."
      },
      {
        "key": "C",
        "text": "determinismo físico, em que a regularidade e a previsibilidade causal governam todos os corpos naturais.",
        "comment": "Correta. O universo mecanicista é regido por leis deterministas invioláveis e descritíveis matematicamente."
      },
      {
        "key": "D",
        "text": "relativismo estético, que subordina as leis da gravidade às preferências individuais.",
        "comment": "Incorreta. As leis newtonianas pretendem universalidade e objetividade absolutas."
      },
      {
        "key": "E",
        "text": "desprezo pelo cálculo infinitesimal e pelas equações diferenciais.",
        "comment": "Incorreta. Newton foi um dos criadores do cálculo infinitesimal para fundamentar a mecânica celeste."
      }
    ],
    "correct": "C"
  },
  {
    "id": 68,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Epistemologias contemporâneas",
    "difficulty": "Difícil",
    "triWeight": 2.2,
    "baseText": "“A ciência não avança pela acumulação linear de verdades, mas pelo confronto entre programas rivais de pesquisa científica. Um programa é progressivo enquanto seu crescimento teórico antecipa seu crescimento empírico.”",
    "source": "LAKATOS, I. A Metodologia dos Programas de Pesquisa Científica. Lisboa: Edições 70, 1989, p. 48.",
    "command": "Na metodologia de Imre Lakatos, a estrutura que protege as premissas fundamentais de uma teoria contra refutações prematuras é denominada",
    "alternatives": [
      {
        "key": "A",
        "text": "cinturão protetor de hipóteses auxiliares, que absorve e redireciona anomalias empíricas.",
        "comment": "Correta. Lakatos distingue o \"núcleo duro\" (irrefutável por convenção metodológica) do \"cinturão protetor\" de hipóteses ajustáveis para responder a dados desafiadores."
      },
      {
        "key": "B",
        "text": "núcleo flutuante de crenças dogmáticas dependentes da fé religiosa do pesquisador.",
        "comment": "Incorreta. Os programas de pesquisa são estruturas racionais de desenvolvimento científico, não crenças de fé."
      },
      {
        "key": "C",
        "text": "barreira linguística de termos vagos destinada a enganar os comitês de avaliação de bolsas.",
        "comment": "Incorreta. Trata-se de uma tese epistemológica séria sobre heurística negativa e positiva."
      },
      {
        "key": "D",
        "text": "método dialético de anulação completa de qualquer axioma lógico preliminar.",
        "comment": "Incorreta. O núcleo duro preserva os axiomas fundamentais do programa de pesquisa."
      },
      {
        "key": "E",
        "text": "tábula rasa desprovida de qualquer suporte empírico anterior.",
        "comment": "Incorreta. Um programa de pesquisa progressivo prevê novos fatos empíricos corroborados."
      }
    ],
    "correct": "A"
  },
  {
    "id": 69,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência e sociedade",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“A promessa iluminista de que a técnica e a ciência trariam automaticamente a emancipação humana e o fim da barbárie foi tragicamente desmentida pela instrumentalização bélica dos saberes no século XX.”",
    "source": "ADORNO, T. W.; HORKHEIMER, M. Dialética do Esclarecimento. Rio de Janeiro: Zahar, 1985, p. 19.",
    "command": "A crítica formulada pelos autores da Teoria Crítica à \"razão instrumental\" denuncia o processo no qual",
    "alternatives": [
      {
        "key": "A",
        "text": "a investigação científica foi substituída integralmente pela poesia mística renascentista.",
        "comment": "Incorreta. Os autores analisam o triunfo avassalador da tecnociência dominadora, não o retorno à poesia."
      },
      {
        "key": "B",
        "text": "a tecnologia perdeu toda e qualquer capacidade de transformar a matéria e criar bens de consumo.",
        "comment": "Incorreta. A eficácia produtiva da técnica aumentou enormemente; o problema foi sua subordinação à dominação."
      },
      {
        "key": "C",
        "text": "os governos democráticos proibiram a comercialização de patentes industriais.",
        "comment": "Incorreta. O capitalismo industrial estimulou ferozmente patentes e tecnologia."
      },
      {
        "key": "D",
        "text": "a racionalidade científica converteu-se em instrumento cego de dominação da natureza e controle social.",
        "comment": "Correta. A Dialética do Esclarecimento argumenta que a razão iluminista emancipadora degradou-se em razão puramente técnica e instrumental, servindo à opressão e à barbárie."
      },
      {
        "key": "E",
        "text": "os seres humanos voltaram voluntariamente a viver no estado primitivo da pré-história.",
        "comment": "Incorreta. A crítica refere-se à hipertecnologização desumanizada da modernidade tardia."
      }
    ],
    "correct": "D"
  },
  {
    "id": 70,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência para quê?",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "“Não basta formar especialistas capazes de manipular reatores ou escrever códigos sofisticados; se a universidade não formar cidadãos com sensibilidade ética, ela estará apenas adestrando técnicos eficientes para qualquer tirania.”",
    "source": "SANTOS, Boaventura de Sousa. Pela Mão de Alice: o social e o político na pós-modernidade. São Paulo: Cortez, 2000, p. 172.",
    "command": "O papel social da formação científica defendido pelo sociólogo pressupõe que o saber acadêmico deve",
    "alternatives": [
      {
        "key": "A",
        "text": "isolar os estudantes de debates políticos para garantir a pureza laboratorial dos experimentos.",
        "comment": "Incorreta. O autor combate expressamente a alienação política e o tecnicismo cego."
      },
      {
        "key": "B",
        "text": "integrar a qualificação técnica ao compromisso democrático e à responsabilidade ética cidadã.",
        "comment": "Correta. A universidade emancipatória une excelência científica com formação humanista e consciência crítica coletiva."
      },
      {
        "key": "C",
        "text": "substituir as disciplinas científicas por treinos militares de obediência incondicional.",
        "comment": "Incorreta. O autor condena a formação voltada a qualquer tipo de tirania."
      },
      {
        "key": "D",
        "text": "limitar o acesso aos laboratórios apenas aos herdeiros de grandes fortunas industriais.",
        "comment": "Incorreta. O autor defende a democratização e a justiça social no ensino."
      },
      {
        "key": "E",
        "text": "proibir a publicação de dados estatísticos que incomodem interesses particulares.",
        "comment": "Incorreta. A transparência e o compromisso público são alicerces da universidade cidadã."
      }
    ],
    "correct": "B"
  },
  {
    "id": 71,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência moderna",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "“Ao deslocar a Terra do centro imóvel do universo e colocá-la em órbita ao redor do Sol, Copérnico não mudou apenas a astronomia; ele abalou a crença antropocêntrica de que o ser humano era o ápice geográfico da Criação.”",
    "source": "ROSSI, P. O Nascimento da Ciência Moderna na Europa. Bauru: Edusc, 2001, p. 77.",
    "command": "A Revolução Copernicana representou uma profunda transformação cultural na medida em que",
    "alternatives": [
      {
        "key": "A",
        "text": "comprovou que o universo foi criado exatamente no ano 4004 a.C. pelos deuses romanos.",
        "comment": "Incorreta. Isso remete a cronologias bíblicas arcaicas que a ciência moderna desconstruiu."
      },
      {
        "key": "B",
        "text": "reforçou a autoridade incontestável da física aristotélica e da cosmologia ptolemaica.",
        "comment": "Incorreta. Copérnico derrubou o geocentrismo ptolemaico que dominava desde a Antiguidade."
      },
      {
        "key": "C",
        "text": "superou o geocentrismo medieval e descentrou o ser humano da posição de centro cósmico privilegiado.",
        "comment": "Correta. O modelo heliocêntrico provocou um choque filosófico e existencial ao destronar a Terra do centro do cosmos."
      },
      {
        "key": "D",
        "text": "interrompeu a navegação marítima por falta de referenciais estelares confiáveis.",
        "comment": "Incorreta. A nova astronomia aperfeiçoou decisivamente a navegação e a cartografia."
      },
      {
        "key": "E",
        "text": "provou que a matéria física é composta por substâncias mágicas e intangíveis.",
        "comment": "Incorreta. A física que se seguiu a Copérnico fundamentou-se na quantificação mecanicista."
      }
    ],
    "correct": "C"
  },
  {
    "id": 72,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência contemporânea",
    "difficulty": "Difícil",
    "triWeight": 2.2,
    "baseText": "“Na física quântica, o princípio de incerteza de Heisenberg estabelece que não podemos medir com precisão infinita e simultânea a posição e o momento de uma partícula subatômica. O próprio ato de observação interfere no sistema medido.”",
    "source": "HEISENBERG, W. Física e Filosofia. Brasília: Editora UnB, 1998, p. 52.",
    "command": "As implicações filosóficas do princípio de incerteza para a teoria do conhecimento colocam em xeque",
    "alternatives": [
      {
        "key": "A",
        "text": "a própria existência de qualquer objeto material fora dos sonhos do observador.",
        "comment": "Incorreta. A física quântica não é um solipsismo mágico; partículas e campos interagem materialmente."
      },
      {
        "key": "B",
        "text": "a validade dos testes empíricos em favor do dogma teológico pré-moderno.",
        "comment": "Incorreta. A mecânica quântica é a teoria mais rigorosamente testada da história da física."
      },
      {
        "key": "C",
        "text": "a utilidade de computadores e equipamentos semicondutores na indústria moderna.",
        "comment": "Incorreta. Os semicondutores e lasers operam exatamente graças aos princípios da mecânica quântica."
      },
      {
        "key": "D",
        "text": "o determinismo mecanicista clássico e o pressuposto de uma observação neutra desvinculada do aparelho experimental.",
        "comment": "Correta. O princípio de Heisenberg rompe com a premissa newtoniana de um determinismo estrito de trajetórias e evidencia a inseparabilidade entre sistema e medição."
      },
      {
        "key": "E",
        "text": "o uso de fórmulas matemáticas na formulação das hipóteses científicas contemporâneas.",
        "comment": "Incorreta. O formalismo matemático da mecânica quântica é de extrema sofisticação analítica."
      }
    ],
    "correct": "D"
  },
  {
    "id": 73,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Epistemologias contemporâneas",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“A objetividade científica não depende da ausência de paixões no indivíduo cientista, mas da cooperação amigavelmente hostil e do debate crítico público institucionalizado na comunidade de pesquisadores.”",
    "source": "POPPER, K. A Sociedade Aberta e Seus Inimigos. Belo Horizonte: Itatiaia, 1987, v. 2, p. 231.",
    "command": "Segundo a perspectiva de Karl Popper, a objetividade do saber científico é garantida pela",
    "alternatives": [
      {
        "key": "A",
        "text": "crítica intersubjetiva e controle mútuo aberto e público das hipóteses pela comunidade científica.",
        "comment": "Correta. Para Popper, a objetividade é um produto social e institucional da livre crítica intersubjetiva e dos testes rigorosos partilhados."
      },
      {
        "key": "B",
        "text": "santidade moral e pureza espiritual inata de cada pesquisador individual.",
        "comment": "Incorreta. Cientistas individuais têm preconceitos; é a crítica intersubjetiva que assegura a depuração das teses."
      },
      {
        "key": "C",
        "text": "censura estatal de ideias discordantes em favor do discurso oficial do partido.",
        "comment": "Incorreta. Popper é ferrenho defensor da sociedade aberta contra qualquer autoritarismo."
      },
      {
        "key": "D",
        "text": "unificação compulsória de todos os periódicos acadêmicos em uma só voz governamental.",
        "comment": "Incorreta. O monopólio editorial destruiria o debate crítico plural."
      },
      {
        "key": "E",
        "text": "adoção irrestrita do princípio de autoridade dos catedráticos mais antigos.",
        "comment": "Incorreta. A ciência progride desafiando autoridades consagradas por meio de contraexemplos empíricos."
      }
    ],
    "correct": "A"
  },
  {
    "id": 74,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência para quê?",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“O desenvolvimento acelerado da inteligência artificial e da edição genética exige que a bioética não seja um adendo burocrático posterior, mas um princípio arquitetônico que oriente o desenho das tecnologias desde sua origem.”",
    "source": "HOTTOIS, G. Da Renascença ao Pós-Modernismo: elementos para uma história da filosofia. Lisboa: Instituto Piaget, 2003, p. 341.",
    "command": "A inserção da reflexão bioética no coração da pesquisa tecnocientífica responde ao desafio de",
    "alternatives": [
      {
        "key": "A",
        "text": "impedir que novas descobertas médicas curem doenças congênitas da população.",
        "comment": "Incorreta. A bioética visa salvaguardar a vida e a dignidade, incentivando a cura segura de moléstias."
      },
      {
        "key": "B",
        "text": "subordinar a biologia molecular aos mandamentos da astrologia medieval.",
        "comment": "Incorreta. Trata-se de ética aplicada à alta tecnologia contemporânea."
      },
      {
        "key": "C",
        "text": "prevenir impactos desumanizadores, eugênicos e discriminatórios decorrentes do uso irrestrito da técnica.",
        "comment": "Correta. A bioética zela para que o poder tecnocientífico não viole a dignidade humana, a justiça distributiva e a integridade da vida."
      },
      {
        "key": "D",
        "text": "garantir que apenas empresas com fins lucrativos decidam sobre o futuro genético da humanidade.",
        "comment": "Incorreta. Isso representaria a captura predatória da tecnologia sem freios éticos."
      },
      {
        "key": "E",
        "text": "eliminar o debate democrático dos parlamentos e tribunais de justiça.",
        "comment": "Incorreta. A bioética exige deliberação pública ampla e democrática."
      }
    ],
    "correct": "C"
  },
  {
    "id": 75,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Mudanças climáticas",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“A crise socioambiental do Antropoceno decorre da ilusão de que a biosfera terrestre é um reservatório inesgotável de recursos a serem extraídos e uma lixeira infinita para os dejetos da industrialização predatória.”",
    "source": "DANOWSKI, D.; VIVEIROS DE CASTRO, E. Há mundo por vir? Ensaio sobre os medos e os fins. Desterro: Cultura e Barbárie, 2014, p. 28.",
    "command": "O conceito de Antropoceno utilizado pelos filósofos contemporâneos aponta para o fato de que",
    "alternatives": [
      {
        "key": "A",
        "text": "a humanidade industrial tornou-se uma força geológica capaz de alterar os equilíbrios biofísicos do planeta.",
        "comment": "Correta. O Antropoceno caracteriza a nova época geológica na qual as atividades humanas industrializadas alteram irreversivelmente os sistemas terrestres fundamentais."
      },
      {
        "key": "B",
        "text": "a natureza recupera-se espontaneamente e sem sequelas de qualquer poluição química pesada.",
        "comment": "Incorreta. As sequelas climáticas e ecotoxicológicas são graves e duradouras."
      },
      {
        "key": "C",
        "text": "os animais não-humanos foram os principais responsáveis pela crise do efeito estufa.",
        "comment": "Incorreta. A responsabilidade é antrópica, especialmente dos modelos de produção e consumo dominantes."
      },
      {
        "key": "D",
        "text": "a geologia planetária retornou ao ciclo natural da Era do Gelo sem interferência fabril.",
        "comment": "Incorreta. O aquecimento global interrompeu bruscamente as oscilações naturais de longo prazo."
      },
      {
        "key": "E",
        "text": "os povos indígenas causaram a destruição das florestas tropicais com suas técnicas milenares.",
        "comment": "Incorreta. Os povos tradicionais são guardiões comprovados da biodiversidade florestal."
      }
    ],
    "correct": "A"
  },
  {
    "id": 76,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência moderna",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "“Saber é poder. A natureza só se vence obedecendo-lhe; o que na teoria se chama causa, na prática chama-se regra para a ação e domínio das forças materiais.”",
    "source": "BACON, F. Novum Organum. Aforismo III. São Paulo: Abril Cultural, 1979, p. 27.",
    "command": "O aforismo de Francis Bacon resume a vocação pragmática da ciência moderna ao proclamar que",
    "alternatives": [
      {
        "key": "A",
        "text": "o conhecimento autêntico deve ser contemplativo e recusar qualquer aplicação instrumental.",
        "comment": "Incorreta. Bacon combate o contemplativismo estéril dos gregos e escolásticos."
      },
      {
        "key": "B",
        "text": "o ser humano deve se submeter aos desígnios mágicos dos espíritos florestais.",
        "comment": "Incorreta. Bacon defende o domínio racional e mecânico da matéria."
      },
      {
        "key": "C",
        "text": "as teorias científicas são dispensáveis quando se possuem armas militares poderosas.",
        "comment": "Incorreta. O poder humano funda-se na descoberta teórica das causas e leis da natureza."
      },
      {
        "key": "D",
        "text": "a natureza é um ser caprichoso e inalcançável por qualquer raciocínio lógico.",
        "comment": "Incorreta. A natureza possui leis fixas que o intelecto pode desvendar por meio do método."
      },
      {
        "key": "E",
        "text": "a compreensão das leis causais da natureza é a condição necessária para dominá-la e utilizá-la em proveito humano.",
        "comment": "Correta. \"Saber é poder\": conhecer as causas naturais permite operar sobre elas e produzir efeitos práticos benéficos à condição humana."
      }
    ],
    "correct": "E"
  },
  {
    "id": 77,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência contemporânea",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“O pensamento complexo não rejeita a clareza nem a ordem, mas recusa o reducionismo que despedaça o todo em fragmentos isolados e desconsidera as interações e retroações ecológicas entre as partes.”",
    "source": "MORIN, E. Introdução ao Pensamento Complexo. Porto Alegre: Sulina, 2005, p. 62.",
    "command": "A epistemologia da complexidade formulada por Edgar Morin propõe como superação do paradigma clássico a",
    "alternatives": [
      {
        "key": "A",
        "text": "eliminação completa dos laboratórios especializados em nome da especulação astrológica.",
        "comment": "Incorreta. Morin não nega as disciplinas especializadas, mas exige sua religação transdisciplinar."
      },
      {
        "key": "B",
        "text": "articulação transdisciplinar entre os saberes capaz de compreender os sistemas em suas totalidades e interdependências.",
        "comment": "Correta. O pensamento complexo combate a mutilação hiperespecializada e propõe a contextualização e religação dos saberes."
      },
      {
        "key": "C",
        "text": "adoção do método escolástico medieval baseado em argumentos de autoridade eclesiástica.",
        "comment": "Incorreta. Trata-se de uma epistemologia contemporânea pós-positivista."
      },
      {
        "key": "D",
        "text": "afirmação de que qualquer fato científico tem o mesmo valor epistêmico que um boato sem checagem.",
        "comment": "Incorreta. O pensamento complexo não é relativismo superficial nem pós-verdade."
      },
      {
        "key": "E",
        "text": "proibição do uso de computadores nas análises ecológicas globais.",
        "comment": "Incorreta. Os modelos computacionais são vitais para simular sistemas complexos."
      }
    ],
    "correct": "B"
  },
  {
    "id": 78,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Epistemologias contemporâneas",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "“Nenhum número de experimentos favoráveis pode provar de modo conclusivo que a teoria da gravidade está correta, mas basta uma única maçã que caia para cima para derrubá-la por completo.”",
    "source": "POPPER, K. Conjecturas e Refutações. Brasília: Editora UnB, 1982, p. 58.",
    "command": "A metáfora popperiana ilustra com precisão a assimetria lógica existente entre",
    "alternatives": [
      {
        "key": "A",
        "text": "a dedução matemática e a intuição poética de autores românticos.",
        "comment": "Incorreta. O trecho trata da relação lógica entre observações particulares e hipóteses universais."
      },
      {
        "key": "B",
        "text": "a química inorgânica e os mistérios alquímicos do elixir da longa vida.",
        "comment": "Incorreta. A assimetria refere-se ao problema da indução e refutabilidade."
      },
      {
        "key": "C",
        "text": "o senso comum e a autoridade dos manuais pedagógicos estatais.",
        "comment": "Incorreta. Popper discute a demarcação e a lógica da justificação científica."
      },
      {
        "key": "D",
        "text": "a verificação empírica indutiva e a refutação lógica dedutiva (Modus Tollens).",
        "comment": "Correta. Milhões de cisnes brancos não provam a universalidade, mas um único contraexemplo preto refuta logicamente a tese universal (assimetria da falseabilidade)."
      },
      {
        "key": "E",
        "text": "as teorias físicas do século XVII e as descobertas geográficas das Grandes Navegações.",
        "comment": "Incorreta. Trata-se de uma regra de inferência epistemológica universal."
      }
    ],
    "correct": "D"
  },
  {
    "id": 79,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência e sociedade",
    "difficulty": "Difícil",
    "triWeight": 2.2,
    "baseText": "“A ciência ocidental moderna construiu-se a partir de um paradigma androcêntrico que muitas vezes identificou a natureza com o feminino passivo a ser desvendado, penetrado e dominado pelo olhar do cientista soberano.”",
    "source": "HARAWAY, D. Saberes Localizados: a questão da ciência para o feminismo. Cadernos Pagu, Campinas, n. 5, p. 18, 1995.",
    "command": "A crítica epistemológica feminista formulada por Donna Haraway defende a noção de \"saberes localizados\", propondo que",
    "alternatives": [
      {
        "key": "A",
        "text": "todo conhecimento objetivo deve provir de uma perspectiva divina absoluta e desincorporada.",
        "comment": "Incorreta. Haraway critica o \"truque divino\" de fingir ver tudo de lugar nenhum sem corpo."
      },
      {
        "key": "B",
        "text": "as mulheres devem abandonar qualquer interesse pelo estudo das ciências exatas e biológicas.",
        "comment": "Incorreta. Pelo contrário: propõe transformar a ciência e disputar a produção do conhecimento."
      },
      {
        "key": "C",
        "text": "a verdadeira objetividade exige o reconhecimento da situação histórica, corporal e política de quem produz o saber.",
        "comment": "Correta. Os saberes localizados recusam a falsa pretensão de neutralidade desencarnada e mostram que a objetividade crítica ganha solidez quando o cientista assume sua perspectiva e responsabilidade situadas."
      },
      {
        "key": "D",
        "text": "as teorias da mecânica clássica perderam toda utilidade para a engenharia de pontes e edifícios.",
        "comment": "Incorreta. Haraway não prega o descarte empírico da física, mas a crítica das mitologias de dominação."
      },
      {
        "key": "E",
        "text": "a pesquisa científica não deve mais dialogar com evidências materiais empíricas.",
        "comment": "Incorreta. Trata-se de um empirismo radical e situado, intimamente ligado à materialidade."
      }
    ],
    "correct": "C"
  },
  {
    "id": 80,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência para quê?",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "“Quando a técnica se torna um fim em si mesma, os seres humanos deixam de ser os sujeitos que utilizam ferramentas e passam a ser os objetos adaptados às exigências de produtividade dos próprios aparelhos.”",
    "source": "ELLUL, J. A Sociedade Tecnológica. Petrópolis: Vozes, 1968, p. 88.",
    "command": "A advertência do filósofo Jacques Ellul problematiza a tecnocracia contemporânea ao apontar o risco da",
    "alternatives": [
      {
        "key": "A",
        "text": "inversão entre meios e fins, na qual a humanidade se torna serva das demandas do maquinário.",
        "comment": "Correta. A tecnolatria inverte a relação instrumental: o ser humano passa a viver em função dos imperativos autônomos da técnica."
      },
      {
        "key": "B",
        "text": "destruição voluntária de todas as indústrias farmacêuticas e hospitais modernos.",
        "comment": "Incorreta. O texto analisa a dependência existencial perante o imperativo técnico, não vandalismo hospitalar."
      },
      {
        "key": "C",
        "text": "substituição definitiva dos motores a combustão por tração animal nas grandes cidades.",
        "comment": "Incorreta. A sociedade tecnológica expandiu o automatismo mecânico."
      },
      {
        "key": "D",
        "text": "eliminação completa da burocracia governamental e das corporações de telecomunicações.",
        "comment": "Incorreta. A técnica fortalece imensamente a burocracia e a gestão algorítmica."
      },
      {
        "key": "E",
        "text": "adoção irrestrita da moralidade franciscana pelos diretores das big techs.",
        "comment": "Incorreta. A lógica tecnocrática é guiada pela eficiência instrumental desprovida de ascese humanista."
      }
    ],
    "correct": "A"
  },
  {
    "id": 81,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Mudanças climáticas",
    "difficulty": "Fácil",
    "triWeight": 1,
    "baseText": "“Não podemos resolver os problemas criados pelo modelo de crescimento fóssil predatório utilizando a mesma mentalidade utilitarista que os gerou. Precisamos de uma nova relação ética com os ciclos da Terra.”",
    "source": "BOFF, L. Sustentabilidade: o que é – o que não é. Petrópolis: Vozes, 2012, p. 45.",
    "command": "Para superar o colapso climático contemporâneo, a reflexão filosófica ambientalista preconiza",
    "alternatives": [
      {
        "key": "A",
        "text": "a aceleração do desmatamento para abrir espaço a novas usinas termelétricas a carvão.",
        "comment": "Incorreta. As termelétricas a carvão são os maiores emissores de carbono e agravam o colapso."
      },
      {
        "key": "B",
        "text": "a superação da mentalidade predatória em favor de um modelo de cuidado ecológico e sustentabilidade integral.",
        "comment": "Correta. Boff defende a transição ecológica centrada no cuidado, no respeito à capacidade de carga da Terra e na justiça climática."
      },
      {
        "key": "C",
        "text": "a negação de que a poluição dos rios e oceanos afete as espécies marinhas.",
        "comment": "Incorreta. A poluição por plásticos e efluentes corrói os ecossistemas marinhos."
      },
      {
        "key": "D",
        "text": "a transferência da população empobrecida para colônias espaciais inabitáveis em Marte.",
        "comment": "Incorreta. A solução reside em cuidar da nossa casa comum, não em fantasias de fuga planetária."
      },
      {
        "key": "E",
        "text": "a extinção de qualquer legislação que proteja as unidades de conservação e terras indígenas.",
        "comment": "Incorreta. As unidades protegidas e territórios ancestrais são essenciais para a preservação climática."
      }
    ],
    "correct": "B"
  },
  {
    "id": 82,
    "unitId": "u1",
    "chapterId": "cap2",
    "topic": "Ciência moderna",
    "difficulty": "Médio",
    "triWeight": 1.5,
    "baseText": "“A ciência moderna operou uma cisão radical entre o mundo das qualidades primárias (tamanho, forma, movimento, mensuráveis matematicamente) e o das qualidades secundárias (cores, odores, sabores, tidas como subjetivas).”",
    "source": "BURTT, E. A. As Bases Metafísicas da Ciência Moderna. Brasília: Editora UnB, 1991, p. 64.",
    "command": "Essa distinção, formulada por Galileu e Locke, foi decisiva para a consolidação da física moderna porque",
    "alternatives": [
      {
        "key": "A",
        "text": "provou que as cores são as únicas propriedades que existem de modo objetivo no cosmos.",
        "comment": "Incorreta. As cores foram classificadas justamente como qualidades secundárias subjetivas."
      },
      {
        "key": "B",
        "text": "afirmou a supremacia dos relatos poéticos da Bíblia sobre as medidas astronômicas.",
        "comment": "Incorreta. A física moderna consagrou a medição quantitativa autônoma."
      },
      {
        "key": "C",
        "text": "delimitou o domínio científico ao que é objetivamente quantificável e passível de tratamento matemático.",
        "comment": "Correta. Ao privilegiar as qualidades primárias mensuráveis, a ciência moderna estabeleceu a física quantitativa e reproduzível como padrão de cientificidade."
      },
      {
        "key": "D",
        "text": "obrigou os físicos a pintar seus aparelhos de laboratório com cores vivas para atrair investimento.",
        "comment": "Incorreta. A separação é conceitual e epistemológica, sem qualquer relação cosmética."
      },
      {
        "key": "E",
        "text": "eliminou a experimentação empírica em benefício exclusivo de debates literários.",
        "comment": "Incorreta. O laboratório moderno articulou a experimentação instrumental com a matemática."
      }
    ],
    "correct": "C"
  }
];
