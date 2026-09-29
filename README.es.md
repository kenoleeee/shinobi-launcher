<p align="center">
  <img src="docs/icon.png" width="128" height="128" alt="Icono de Shinobi Launcher">
</p>

<h1 align="center">Shinobi Launcher</h1>

<p align="center">
  <a href="README.md">English</a> · <b>Español</b> · <a href="README.pt-BR.md">Português</a> · <a href="README.de.md">Deutsch</a> · <a href="README.ru.md">Русский</a>
</p>

<p align="center">
  <b>Juega a Naruto Online en tu Mac.</b><br>
  Un launcher para macOS no oficial, gratuito y de código abierto para el MMO en Flash <i>Naruto Online</i>,
  con el Flash Player real de Adobe, inicio con un clic y extras útiles.
</p>

<p align="center">
  <a href="https://github.com/kenoleeee/shinobi-launcher/releases/latest"><img alt="Última versión" src="https://img.shields.io/github/v/release/kenoleeee/shinobi-launcher?label=descargar&color=ff7a1a"></a>
  <img alt="macOS 11+" src="https://img.shields.io/badge/macOS-11%2B-black?logo=apple">
  <img alt="Apple Silicon e Intel" src="https://img.shields.io/badge/Apple%20Silicon%20%26%20Intel-compatible-555">
  <a href="LICENSE"><img alt="Licencia MIT" src="https://img.shields.io/badge/licencia-MIT-blue"></a>
</p>

---

Naruto Online sigue funcionando con Adobe Flash, que ya no admite ningún navegador moderno, y el
launcher oficial solo existe para Windows. Los emuladores como Ruffle todavía no pueden con el juego
(la carga se queda en torno al 17 %). Shinobi Launcher ejecuta el juego con el **Flash Player real**,
así que funciona igual que en Windows.

## Funciones

- 🎮 **Flash Player real.** El juego usa el Adobe Flash Player 32 original, no un emulador.
- 🚀 **Un clic para jugar.** Vuelve a abrir el último servidor en el que jugaste, directamente en el juego.
- 🔐 **Sesión guardada.** Tu inicio de sesión se mantiene 30 días, y también funciona el acceso con Google.
- 👥 **Varias cuentas.** Cada cuenta se abre en su propia ventana, por ejemplo tu cuenta principal y una secundaria a la vez.
- 🖥 **Modo limpio.** Oculta la barra del sitio web para que el juego ocupe toda la ventana o la pantalla.
- ⚡ **Carga más rápida.** Caché permanente de 2 GB para el juego y bloqueo de anuncios y rastreadores.
- 😴 **Mac despierto.** El Mac no entra en reposo mientras haya una ventana del juego abierta; ideal para farmear AFK.
- 📸 **Atajos.** Las capturas van directamente a *Imágenes → Naruto Online*, y una tecla silencia el sonido.
- 🩹 **Arregla un bloqueo frecuente.** La carga ya no se queda en el 14–15 % cuando el juego elige un servidor de respaldo inaccesible.
- 🔄 **Avisos de actualización** cuando sale una versión nueva.

## Instalación

1. Descarga **`Shinobi-Launcher-x.y.z.dmg`** desde la [última versión](https://github.com/kenoleeee/shinobi-launcher/releases/latest).
2. Ábrelo y arrastra **Shinobi Launcher** a **Aplicaciones**.
3. Abre Shinobi Launcher. La primera vez, macOS lo bloqueará porque no viene de la App Store:
   - Abre **Ajustes del Sistema → Privacidad y seguridad**, baja hasta el final y pulsa **Abrir igualmente** junto a *Shinobi Launcher*.
   - O ejecuta esto una vez en Terminal:
     ```sh
     xattr -dr com.apple.quarantine "/Applications/Shinobi Launcher.app"
     ```
4. **Apple Silicon (M1/M2/M3/M4):** si macOS pide instalar **Rosetta**, pulsa *Instalar*.
   Adobe nunca hizo Flash para los chips de Apple, así que Rosetta es necesario.
5. En el primer inicio el launcher descarga Flash Player (unos 20 MB), lo que tarda más o menos un minuto.
   Después se abre el juego.

**Requisitos:** macOS 11 Big Sur o posterior, en Apple Silicon o Intel.

## Cómo se usa

Los menús de la app están en inglés:

| Acción | Menú / atajo |
|---|---|
| Iniciar sesión con Google (o correo) | **Account → Sign In with Google / Email…** · `⌘⇧L` |
| Añadir una segunda cuenta (ventana nueva) | **Account → Add Another Account** · `⌘⇧N` |
| Cambiar de cuenta | `⌘1`, `⌘2`, … |
| Volver a la lista de servidores | `⌘H` |
| Captura de pantalla | `⌘⇧S` |
| Silenciar / activar sonido | `⌘⇧M` |
| Activar/desactivar el modo limpio | `⌘⇧C` |
| Pantalla completa | `⌃⌘F` |

El acceso con correo y contraseña funciona directamente en la web del juego. El **acceso con Google**
lo bloquea Google en los navegadores compatibles con Flash, así que usa
**Account → Sign In with Google / Email…**. Se abre una pequeña ventana basada en Safari; cuando
inicias sesión se cierra sola y el launcher entra con tu cuenta.

## Cómo se gestiona Flash

Adobe Flash Player no se puede redistribuir, así que **no está incluido en esta app ni en este repositorio.**
En el primer inicio el launcher:

1. Descarga el instalador oficial de Adobe *Flash Player 32.0.0.330 para Mac* desde la
   [copia de Internet Archive del archivo oficial de Flash Player de Adobe](https://archive.org/details/fp_32.0.0.330_archive).
2. Comprueba su SHA-256 con la versión conocida de Adobe.
3. Comprueba que el paquete del instalador está firmado por **Adobe Systems, Inc. (JQ525L2MZD)**.
4. Extrae solo el plugin del navegador en `~/Library/Application Support/Shinobi Launcher/`.
   No se instala nada en el sistema.
5. Verifica la firma de código del plugin, que también debe ser de Adobe.

El código está en [`src/flash-setup.js`](src/flash-setup.js).

## Seguridad

Adobe ya no actualiza Flash Player 32. Para mantenerlo aislado:

- El launcher solo abre las webs del juego y las páginas de inicio de sesión de Google/Facebook. Cualquier otro enlace se abre en tu navegador normal.
- Flash solo existe dentro de este launcher, así que tus navegadores no tienen Flash.
- El launcher no recopila datos. Su registro de depuración es local y nunca guarda contraseñas ni tokens de sesión.

## Solución de problemas

<details>
<summary><b>«Shinobi Launcher está dañado / no se puede abrir»</b></summary>

La cuarentena de macOS bloquea las apps descargadas fuera de la App Store. Ejecuta:

```sh
xattr -dr com.apple.quarantine "/Applications/Shinobi Launcher.app"
```
</details>

<details>
<summary><b>Pulsar Login no hace nada / «The login server is temporarily limiting attempts»</b></summary>

Tras demasiados intentos seguidos, el servidor de inicio de sesión del juego bloquea tu IP unos 5 minutos.
Espera y pulsa **Login** una sola vez.
</details>

<details>
<summary><b>Pantalla negra o el juego no carga</b></summary>

Prueba **Game → Force Reload**. Si no funciona, abre **Help → Open Debug Log** y adjunta el
registro a un [nuevo issue](https://github.com/kenoleeee/shinobi-launcher/issues/new/choose).
</details>

<details>
<summary><b>La configuración inicial falla</b></summary>

La descarga de Flash necesita acceso a `archive.org`. Pulsa **Try again**. Si sigue fallando,
[abre un issue](https://github.com/kenoleeee/shinobi-launcher/issues/new/choose) con el mensaje de error.
</details>

## Compilar desde el código fuente

Consulta la sección [*Building from source*](README.md#building-from-source) del README en inglés.

## Apoya el proyecto

Shinobi Launcher es y será siempre gratuito. Si te ha devuelto Naruto Online en tu Mac, puedes
apoyar su desarrollo:

| Moneda | Dirección |
|---|---|
| **ETH / ERC-20** (USDT, USDC) | `0x92277bbeb48218dee7e6fc1248a1cfa768d83850` |
| **BTC** | `1Nsq5PtU8YueBTxpRWXo1BUvihyaRLuaG4` |

⚠️ Envía tokens ERC-20 **solo por la red Ethereum** a la dirección ETH, y solo BTC a la dirección BTC.
También encontrarás estas direcciones en la app, en **Help → Support the Project**.

¡Una ⭐ en GitHub también ayuda!

## Aviso legal

Shinobi Launcher es un **proyecto de fans no oficial**. No está afiliado, respaldado ni relacionado con
Oasis Games, Mars Era, Tencent, Bandai Namco, Masashi Kishimoto / Shueisha ni Adobe.
*Naruto* y *Naruto Online* son marcas de sus respectivos propietarios. Adobe Flash Player es
© Adobe y se descarga desde el propio instalador de Adobe en el primer inicio; no se distribuye aquí.

El launcher no modifica el juego, no da ventajas ni automatiza nada. Solo permite que el juego
oficial funcione en macOS.

## Licencia

[MIT](LICENSE) © 2026 kenoleeee
