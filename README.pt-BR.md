<p align="center">
  <img src="docs/icon.png" width="128" height="128" alt="Ícone do Shinobi Launcher">
</p>

<h1 align="center">Shinobi Launcher</h1>

<p align="center">
  <a href="README.md">English</a> · <a href="README.es.md">Español</a> · <b>Português</b> · <a href="README.de.md">Deutsch</a> · <a href="README.ru.md">Русский</a>
</p>

<p align="center">
  <b>Jogue Naruto Online no seu Mac.</b><br>
  Um launcher para macOS não oficial, gratuito e de código aberto para o MMO em Flash <i>Naruto Online</i>,
  com o Flash Player real da Adobe, início com um clique e extras úteis.
</p>

<p align="center">
  <a href="https://github.com/kenoleeee/shinobi-launcher/releases/latest"><img alt="Versão mais recente" src="https://img.shields.io/github/v/release/kenoleeee/shinobi-launcher?label=baixar&color=ff7a1a"></a>
  <img alt="macOS 11+" src="https://img.shields.io/badge/macOS-11%2B-black?logo=apple">
  <img alt="Apple Silicon e Intel" src="https://img.shields.io/badge/Apple%20Silicon%20%26%20Intel-compat%C3%ADvel-555">
  <a href="LICENSE"><img alt="Licença MIT" src="https://img.shields.io/badge/licen%C3%A7a-MIT-blue"></a>
</p>

---

Naruto Online ainda roda em Adobe Flash, que nenhum navegador moderno suporta, e o launcher oficial
só existe para Windows. Emuladores como o Ruffle ainda não conseguem rodar o jogo (o carregamento
para em cerca de 17%). O Shinobi Launcher roda o jogo com o **Flash Player real**, então funciona
do mesmo jeito que no Windows.

## Recursos

- 🎮 **Flash Player real.** O jogo roda no Adobe Flash Player 32 original, não em um emulador.
- 🚀 **Um clique para jogar.** Reabre o último servidor em que você jogou, direto no jogo.
- 🔐 **Login salvo.** Seu login fica guardado por 30 dias, e o login com Google também funciona.
- 👥 **Várias contas.** Cada conta abre em sua própria janela, por exemplo a conta principal e uma secundária ao mesmo tempo.
- 🖥 **Modo limpo.** Esconde a barra do site para o jogo ocupar a janela ou a tela inteira.
- ⚡ **Carregamento mais rápido.** Cache permanente de 2 GB para o jogo, com anúncios e rastreadores bloqueados.
- 😴 **Mac acordado.** O Mac não entra em repouso enquanto houver uma janela do jogo aberta; ótimo para farmar AFK.
- 📸 **Atalhos.** As capturas de tela vão direto para *Imagens → Naruto Online*, e uma tecla silencia o som.
- 🩹 **Corrige um travamento comum.** O carregamento não fica mais parado em 14–15% quando o jogo escolhe um servidor reserva inacessível.
- 🔄 **Avisos de atualização** quando sai uma versão nova.

## Instalação

1. Baixe **`Shinobi-Launcher-x.y.z.dmg`** na [versão mais recente](https://github.com/kenoleeee/shinobi-launcher/releases/latest).
2. Abra o arquivo e arraste o **Shinobi Launcher** para **Aplicativos**.
3. Abra o Shinobi Launcher. Na primeira vez, o macOS vai bloqueá-lo porque ele não vem da App Store:
   - Abra **Ajustes do Sistema → Privacidade e Segurança**, role até o fim e clique em **Abrir Mesmo Assim** ao lado de *Shinobi Launcher*.
   - Ou rode isto uma vez no Terminal:
     ```sh
     xattr -dr com.apple.quarantine "/Applications/Shinobi Launcher.app"
     ```
4. **Apple Silicon (M1/M2/M3/M4):** se o macOS pedir para instalar o **Rosetta**, clique em *Instalar*.
   A Adobe nunca fez Flash para os chips da Apple, então o Rosetta é necessário.
5. Na primeira execução o launcher baixa o Flash Player (cerca de 20 MB), o que leva mais ou menos um minuto.
   Depois disso o jogo abre.

**Requisitos:** macOS 11 Big Sur ou mais recente, em Apple Silicon ou Intel.

## Como usar

Os menus do app estão em inglês:

| Ação | Menu / atalho |
|---|---|
| Entrar com Google (ou e-mail) | **Account → Sign In with Google / Email…** · `⌘⇧L` |
| Adicionar uma segunda conta (nova janela) | **Account → Add Another Account** · `⌘⇧N` |
| Alternar entre contas | `⌘1`, `⌘2`, … |
| Voltar para a lista de servidores | `⌘H` |
| Captura de tela | `⌘⇧S` |
| Silenciar / ativar som | `⌘⇧M` |
| Ligar/desligar o modo limpo | `⌘⇧C` |
| Tela cheia | `⌃⌘F` |

O login com e-mail e senha funciona direto no site do jogo. O **login com Google** é bloqueado
pelo Google em navegadores compatíveis com Flash, então use **Account → Sign In with Google / Email…**.
Ele abre uma pequena janela baseada no Safari; depois que você entra, ela fecha sozinha e o
launcher faz o login na sua conta.

## Como o Flash é tratado

O Adobe Flash Player não pode ser redistribuído, então **ele não está incluído neste app nem neste repositório.**
Na primeira execução o launcher:

1. Baixa o instalador oficial da Adobe *Flash Player 32.0.0.330 para Mac* a partir do
   [espelho no Internet Archive do arquivo oficial de Flash Player da Adobe](https://archive.org/details/fp_32.0.0.330_archive).
2. Confere o SHA-256 com a versão conhecida da Adobe.
3. Confere se o pacote do instalador é assinado pela **Adobe Systems, Inc. (JQ525L2MZD)**.
4. Extrai apenas o plugin do navegador em `~/Library/Application Support/Shinobi Launcher/`.
   Nada é instalado no sistema.
5. Verifica a assinatura de código do plugin, que também precisa ser da Adobe.

O código está em [`src/flash-setup.js`](src/flash-setup.js).

## Segurança

O Flash Player 32 não recebe mais atualizações da Adobe. Para mantê-lo isolado:

- O launcher só abre os sites do jogo e as páginas de login do Google/Facebook. Qualquer outro link abre no seu navegador normal.
- O Flash existe só dentro deste launcher, então seus navegadores não ganham Flash.
- O launcher não coleta dados. O log de depuração é local e nunca registra senhas nem tokens de login.

## Solução de problemas

<details>
<summary><b>“O Shinobi Launcher está danificado / não pode ser aberto”</b></summary>

A quarentena do macOS bloqueia apps baixados fora da App Store. Rode:

```sh
xattr -dr com.apple.quarantine "/Applications/Shinobi Launcher.app"
```
</details>

<details>
<summary><b>Clicar em Login não faz nada / “The login server is temporarily limiting attempts”</b></summary>

Depois de muitas tentativas seguidas, o servidor de login do jogo bloqueia seu IP por uns 5 minutos.
Espere e clique em **Login** uma única vez.
</details>

<details>
<summary><b>Tela preta ou o jogo não carrega</b></summary>

Tente **Game → Force Reload**. Se não resolver, abra **Help → Open Debug Log** e anexe o log a uma
[nova issue](https://github.com/kenoleeee/shinobi-launcher/issues/new/choose).
</details>

<details>
<summary><b>A configuração inicial falhou</b></summary>

O download do Flash precisa de acesso ao `archive.org`. Clique em **Try again**. Se continuar falhando,
[abra uma issue](https://github.com/kenoleeee/shinobi-launcher/issues/new/choose) com a mensagem de erro.
</details>

## Compilar a partir do código-fonte

Veja a seção [*Building from source*](README.md#building-from-source) do README em inglês.

## Apoie o projeto

O Shinobi Launcher é gratuito e sempre será. Se ele trouxe o Naruto Online de volta ao seu Mac,
você pode apoiar o desenvolvimento:

| Moeda | Endereço |
|---|---|
| **ETH / ERC-20** (USDT, USDC) | `0x92277bbeb48218dee7e6fc1248a1cfa768d83850` |
| **BTC** | `1Nsq5PtU8YueBTxpRWXo1BUvihyaRLuaG4` |

⚠️ Envie tokens ERC-20 **somente pela rede Ethereum** para o endereço ETH, e somente BTC para o endereço BTC.
Esses endereços também estão no app, em **Help → Support the Project**.

Uma ⭐ no GitHub também ajuda!

## Aviso legal

O Shinobi Launcher é um **projeto de fã não oficial**. Não é afiliado, endossado nem ligado à
Oasis Games, Mars Era, Tencent, Bandai Namco, Masashi Kishimoto / Shueisha ou Adobe.
*Naruto* e *Naruto Online* são marcas de seus respectivos donos. O Adobe Flash Player é
© Adobe e é baixado do próprio instalador da Adobe na primeira execução; ele não é distribuído aqui.

O launcher não altera o jogo, não dá vantagens e não automatiza nada. Ele só permite que o jogo
oficial rode no macOS.

## Licença

[MIT](LICENSE) © 2026 kenoleeee
