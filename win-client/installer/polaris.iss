#define MyAppName "Polaris"
#define MyAppVersion "1.2.0"
#define MyAppPublisher "Polaris"
#define MyAppURL "https://github.com/kamkazi1297/polaris"
#define MyAppExeName "Polaris.exe"

[Setup]
AppId={{8F3C2A91-6B47-4E1D-9C55-2A8E7B14D6F0}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={localappdata}\Polaris
DefaultGroupName=Polaris
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=.
OutputBaseFilename=Polaris-Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\{#MyAppExeName}
SetupLogging=yes
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Shortcuts:"

[Files]
Source: "dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Polaris"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\Polaris"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Run Polaris"; Flags: nowait postinstall skipifsilent
