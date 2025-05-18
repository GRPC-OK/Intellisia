import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsIn, // CpuMemoryOption 유효성 검사를 위해 유지
  IsInt,  // replicas 유효성 검사를 위해 유지
  Min,    // replicas 최소값 검사를 위해 유지
  MaxLength,
  // Matches // 필요한 경우 네임스페이스나 프로젝트 이름 형식 검증에 사용
} from 'class-validator';

// CPU/Memory 옵션 (이전과 동일하게 사용 가능)
export const CPU_MEMORY_OPTIONS = ['small', 'medium', 'large'] as const;
export type CpuMemoryOption = typeof CPU_MEMORY_OPTIONS[number];

/**
 * 프로젝트 생성을 위한 최소한의 데이터 전송 객체(DTO)입니다.
 * 기본적인 정보만으로 프로젝트 배포가 가능하도록 설계되었습니다.
 * 복잡한 설정은 시스템 기본값 또는 자동 생성 로직을 따릅니다.
 */
export class CreateProjectMinimalDto {
  /**
   * 프로젝트의 이름입니다. Kubernetes 리소스 이름으로도 사용될 수 있으므로,
   * 명명 규칙(소문자, 숫자, 하이픈만 사용 등)을 따르는 것이 좋습니다.
   * 예: my-awesome-project
   */
  @IsString({ message: '프로젝트 이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '프로젝트 이름은 필수 입력 항목입니다.' })
  @MaxLength(63, { message: '프로젝트 이름은 63자를 초과할 수 없습니다.' }) // K8s 이름 길이 제한 고려
  // @Matches(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, { message: '프로젝트 이름은 Kubernetes 명명 규칙에 맞게 입력해주세요. (소문자, 숫자, 하이픈(-)만 사용, 시작과 끝은 영숫자)' })
  name!: string;

  /**
   * 배포할 애플리케이션의 Git 저장소 URL입니다.
   * 예: https://github.com/your-username/your-repository.git
   */
  @IsUrl({}, { message: '유효한 Git 저장소 URL(클론용)을 입력해주세요.' })
  @IsNotEmpty({ message: 'Git 저장소 URL(클론용)은 필수 입력 항목입니다.' })
  repository!: string;

  // --- 이하 선택적 항목 또는 시스템 기본값 사용 ---

  /**
   * 프로젝트에 대한 간략한 설명입니다. (선택 사항)
   */
  @IsString({ message: '프로젝트 설명은 문자열이어야 합니다.' })
  @IsOptional()
  @MaxLength(200, { message: '프로젝트 설명은 200자를 초과할 수 없습니다.' })
  description?: string;

  /**
   * 사용할 Kubernetes 네임스페이스입니다. (선택 사항)
   * 비워두면 시스템이 프로젝트 이름이나 사용자 정보를 기반으로 자동 생성하거나 기본 네임스페이스를 사용합니다.
   * 예: my-project-ns
   */
  @IsString({ message: '네임스페이스는 문자열이어야 합니다.' })
  @IsOptional()
  @MaxLength(63, { message: '네임스페이스는 63자를 초과할 수 없습니다.' })
  // @Matches(/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/, { message: '네임스페이스는 Kubernetes 명명 규칙에 맞게 입력해주세요.' })
  namespace?: string;

  /**
   * 사용할 CPU/Memory 옵션입니다. (선택 사항)
   * 기본값은 서버에서 'small'로 설정됩니다.
   */
  @IsOptional()
  @IsIn(CPU_MEMORY_OPTIONS, { message: 'CPU/Memory 옵션 값이 유효하지 않습니다. (small, medium, large 중 하나여야 합니다)' })
  cpuMemory?: CpuMemoryOption; // 서버에서 기본값 'small' 처리

  /**
   * 배포할 레플리카(인스턴스) 수입니다. (선택 사항)
   * 기본값은 서버에서 1로 설정됩니다.
   */
  @IsOptional()
  @IsInt({ message: '레플리카 수는 정수여야 합니다.' })
  @Min(1, { message: '레플리카 수는 최소 1 이상이어야 합니다.' })
  replicas?: number; // 서버에서 기본값 1 처리

  /**
   * (참고) GitHub 프로젝트 URL (웹 주소) 필드는 핵심 배포 정보가 아니므로 최소화 DTO에서 제외.
   * 필요시 description에 포함하거나, repository URL에서 간접적으로 유추 가능.
   */

  /**
   * (참고) 사용자 지정 도메인 필드는 초기 배포 후 별도 설정 기능으로 제공하거나,
   * 시스템이 자동 생성된 주소(예: project-name.default-apps.your-cluster.com)를 제공.
   */

  // ownerId: 서버에서 현재 인증된 사용자 정보를 바탕으로 자동 할당 (DTO에서 제거)
  // ingressConfig, serviceConfig, defaultHelmValues: DTO에서 제거.
  // 서버에서 repository 분석, 프로젝트 타입, 기본 템플릿 등을 통해 자동 생성 또는 최적의 기본값 적용.
}